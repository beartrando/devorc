import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import BranchName, {DEFAULT_BRANCH_NAME} from "./branch/value-objects/branch-name.vo";
import {resolve} from 'node:path';

const execFileAsync = promisify(execFile);

type RepositoryStatus = {
    branch: BranchName;
    affected: boolean;
    workingTree: 'clean' | 'dirty';
    origin: 'ahead' | 'behind' | 'diverged' | 'up-to-date' | 'unknown';
};

export class GitService {
    private readonly serviceRepositories = new Map<string, string>();
    private readonly extraRepositories = new Map<string, string>();
    private readonly moduleRepositories = new Map<string, string>();
    private readonly repositoryStatuses = new Map<string, RepositoryStatus>();

    private basePath = '.';

    private readonly projectDir: string;

    private extraRepositoriesEnabled = false;
    private modulesRepositoriesEnabled = false;

    constructor(config: {
        projectDir: string;
        gitServiceRepos: string[];
        gitExtraRepos: string[];
        gitModuleRepos: string[];
    }) {
        this.projectDir = config.projectDir;

        for (const repo of config.gitServiceRepos) {
            this.serviceRepositories.set(repo, repo);
        }

        for (const repo of config.gitExtraRepos) {
            this.extraRepositories.set(repo, repo);
        }

        for (const repo of config.gitModuleRepos) {
            this.moduleRepositories.set(repo, repo);
        }
    }

    getExtraRepositoriesEnabled(): boolean {
        return this.extraRepositoriesEnabled;
    }

    getModulesRepositoriesEnabled(): boolean {
        return this.modulesRepositoriesEnabled;
    }

    createBranchName(issueId: string, title: string): BranchName {
        const id = issueId.match(/(\d+)$/)?.[1] ?? issueId;
        const slug = title.trim().replace(/\s+/g, '-').toLowerCase();

        return BranchName.create(`${id}-${slug}`);
    }

    toggleExtraRepositoriesEnabled(): void {
        this.extraRepositoriesEnabled = !this.extraRepositoriesEnabled;
    }

    toggleModulesRepositoriesEnabled(): void {
        this.modulesRepositoriesEnabled = !this.modulesRepositoriesEnabled;

    }

    getRepositories(): Map<string, string> {
        const repositories = new Map<string, string>([
            ['base', this.projectDir],
        ]);

        for (const [name, path] of this.serviceRepositories) {
            repositories.set(name, path);
        }

        if (this.extraRepositoriesEnabled) {
            for (const [name, path] of this.extraRepositories) {
                repositories.set(name, path);
            }
        }

        if (this.modulesRepositoriesEnabled) {
            for (const [name, path] of this.moduleRepositories) {
                repositories.set(name, path);
            }
        }

        return repositories;
    }

    async setBranch(name: BranchName): Promise<void> {
        await this.checkoutBranch(this.basePath, name);
    }

    addServiceRepository(name: string, path: string): void {
        this.serviceRepositories.set(name, path);
    }

    addExtraRepository(name: string, path: string): void {
        this.extraRepositories.set(name, path);
    }

    addModuleRepository(name: string, path: string): void {
        this.moduleRepositories.set(name, path);
    }

    getRepositoryStatuses(): Map<string, RepositoryStatus> {
        return new Map(this.repositoryStatuses);
    }

    async refreshRepositoryStatuses(): Promise<void> {
        const repositories = this.getRepositories();

        for (const [name, path] of repositories) {
            try {
                console.log('Refresh', name);
                const counts = await this.git(path, [
                    'fetch',
                ]);
            } catch {
                console.error('smth went wrong. git was not updated')
            }

        }
    }

    async getBaseBranch(): Promise<BranchName> {
        return BranchName.create(await this.git(this.basePath, ['branch', '--show-current']));
    }

    async calculateRepositoryStatuses(): Promise<Map<string, RepositoryStatus>> {

        const repositories = this.getRepositories();

        for (const [name, path] of repositories) {
            let affected = true;
            try {
                const branch = BranchName.create(await this.git(path, ['branch', '--show-current']));

                affected = !branch.isDefault();

                const workingTree = await this.git(path, ['status', '--porcelain']);

                affected = affected || Boolean(workingTree);

                let origin: RepositoryStatus['origin'] = 'unknown';

                try {
                    const counts = await this.git(path, [
                        'rev-list',
                        '--left-right',
                        '--count',
                        `HEAD...origin/${branch.value}`,
                    ]);

                    const [ahead, behind] = counts.split(/\s+/).map(Number);

                    if (ahead > 0 && behind > 0) {
                        origin = 'diverged';
                        affected = true;
                    } else if (ahead > 0) {
                        origin = 'ahead';
                        affected = true;
                    } else if (behind > 0) {
                        origin = 'behind';
                        affected = true;
                    } else {
                        origin = 'up-to-date';
                    }
                } catch {
                    origin = 'unknown';
                }

                this.repositoryStatuses.set(name, {
                    branch,
                    affected,
                    workingTree: workingTree ? 'dirty' : 'clean',
                    origin,
                });
            } catch (error) {
                console.error(`Failed to check repository "${name}":`, error);

                this.repositoryStatuses.set(name, {
                    branch: BranchName.create('ERROR'),
                    affected,
                    workingTree: 'dirty',
                    origin: 'unknown',
                });
            }
        }

        return this.getRepositoryStatuses();
    }

    private async git(path: string, args: string[]): Promise<string> {
        const {stdout} = await execFileAsync(
            'git',
            args,
            {cwd: resolve(this.projectDir, path)},
        );

        return stdout.trim();
    }

    async currentBranch(path: string): Promise<string> {
        return await this.git(path, [
            'branch',
            '--show-current',
        ]);
    }


    async checkoutBranch(path: string, branchName: BranchName): Promise<void> {
        const currentBranch = await this.currentBranch(path);
        const changes = await this.git(path, [
            'status',
            '--porcelain',
        ]);

        if (changes) {
            if (currentBranch !== branchName.value) {
                const branches = await this.git(path, [
                    'branch',
                    '--list',
                    branchName.value,
                ]);

                if (branches) {
                    await this.git(path, ['switch', branchName.value]);
                } else {
                    await this.git(path, ['switch', '-c', branchName.value]);
                }
            }

            const remoteBranch = await this.git(path, [
                'ls-remote',
                '--heads',
                'origin',
                `refs/heads/${branchName.value}`,
            ]);

            if (remoteBranch) {
                await this.git(path, ['pull', 'origin', branchName.value]);
            }

        }
    }

    async checkoutBranches(branchName?: BranchName): Promise<void> {
        branchName ??= await this.getBaseBranch();
        const repositories = this.getRepositories();
        const errors: string[] = [];

        for (const [name, path] of repositories) {
            console.log(name);
            try {
                await this.checkoutBranch(path, branchName);
            } catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : String(error);

                errors.push(`${name}: ${message}`);
            }
        }

        if (errors.length > 0) {
            throw new Error(
                `Failed to switch repositories to branch "${branchName.value}":\n${errors.join('\n')}`,
            );
        }
    }


    getListOfAffectedBranches(): Set<BranchName> {
        return new Set(
            [...this.repositoryStatuses.values()]
                .filter(status => status.affected)
                .map(status => status.branch),
        );
    }


    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    // async executeForAll(
    //     operation: (name: string, path: string) => Promise<unknown>,
    //     repositories: Map<string, string>,
    // ): Promise<void> {
    //     for (const [name, path] of repositories) {
    //         await operation(name, path);
    //     }
    // }

    // async commit(
    //     message?: string,
    // ): Promise<void> {
    //     const branchName = await this.getBaseBranch();
    //     message = message || branchName.value;
    //
    //     await this.executeForAll(async (name, path) => {
    //         await this.git(path, ['add', '-A']);
    //
    //         const status = await this.git(path, [
    //             'status',
    //             '--porcelain',
    //         ]);
    //
    //         if (status) {
    //             await this.git(path, ['commit', '-m', message]);
    //         } else {
    //             console.log(`${name}: nothing to commit`);
    //         }
    //     }, this.getRepositories());
    // }
    //
    // async pull(): Promise<void> {
    //     await this.executeForAll(async (name, path) => {
    //         console.log(`${name}: pulling`);
    //         await this.git(path, ['pull']);
    //     }, this.getRepositories());
    // }
    //
    // async push(): Promise<void> {
    //     await this.executeForAll(async (name, path) => {
    //         console.log(`${name}: pushing`);
    //         await this.git(path, ['push']);
    //     }, this.getRepositories());
    // }
    //
    // async commitAndPush(
    //     message?: string,
    // ): Promise<void> {
    //     const branchName = await this.getBaseBranch();
    //
    //     message = message || branchName.value;
    //
    //     await this.checkoutBranches(branchName);
    //     await this.commit(message);
    //     await this.pull();
    //     await this.push();
    // }
    //
    // async checkoutAndPull(): Promise<void> {
    //     await this.checkoutBranches();
    //     await this.pull();
    // }
    //
    // async park(
    //     message?: string,
    // ): Promise<void> {
    //     const branchName = await this.getBaseBranch();
    //
    //     message = message || branchName.value;
    //
    //     await this.commitAndPush(message);
    //
    //     this.setBranch(BranchName.create(DEFAULT_BRANCH_NAME));
    //     await this.checkoutBranches();
    //     await this.pull();
    // }
    //
    async getProjectRepo(): Promise<string> {
        const url = await this.git(this.basePath, ['remote', 'get-url', 'origin']);

        return url
            .replace(/\.git$/, '')
            .replace(/^.*github\.com[:/]/, '');
    }
}

export default GitService;
