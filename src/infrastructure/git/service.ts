import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import BranchName from "./branch/value-objects/branch-name.vo";
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

    private extraRepositoriesEnabled = true;
    private modulesRepositoriesEnabled = true;

    constructor(config: {
        projectDir: string;
        gitServiceRepos: string[];
        gitExtraRepos: string[];
        gitModuleRepos: string[];
        extraReposEnabledByDefault: boolean,
        moduleReposEnabledByDefault: boolean,
    }) {
        this.extraRepositoriesEnabled = config.extraReposEnabledByDefault;
        this.modulesRepositoriesEnabled = config.moduleReposEnabledByDefault;
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

    getRepositories(affectedOnly = false): Map<string, string> {
        const repositories = new Map<string, string>();

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

        repositories.set('.', this.projectDir);

        if (affectedOnly) {
            return new Map(
                [...repositories].filter(([name]) =>
                    this.repositoryStatuses.get(name)?.affected,
                ),
            );
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

    async getBranch(path?: string): Promise<BranchName> {
        path ??= this.basePath;
        return BranchName.create(await this.git(path, ['branch', '--show-current']));
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

    async currentBranch(path: string): Promise<BranchName> {
        return BranchName.create(await this.git(path, [
            'branch',
            '--show-current',
        ]));
    }

    async isCleanStage(path: string): Promise<boolean> {
        return !await this.git(path, [
            'status',
            '--porcelain',
            '--ignore-submodules=all',
        ]);

    }

    async checkoutBranch(path: string, branchName: BranchName): Promise<void> {
        if (!this.isCleanStage(path)) {
            return;
        }

        const currentBranch = await this.currentBranch(path);

        const branches = await this.git(path, [
            'branch',
            '--list',
            branchName.value,
        ]);

        const remoteBranches = await this.git(path, [
            'branch',
            '-r',
            '--list',
            '*/' + branchName.value,
        ]);

        // console.log('branch=', branchName.value);
        // console.log('branches=', branches);
        // console.log('remoteBranches=', remoteBranches);

        if (branches) {
            await this.git(path, ['switch', branchName.value]);
            return;
        }

        if (remoteBranches) {
            if (!branches) {
                await this.git(path, ['checkout', '-b', branchName.value]);
            } else {
                await this.git(path, ['switch', '--track', 'origin/' + branchName.value]);
            }
        }
    }

    async checkoutBranches(branchName?: BranchName): Promise<void> {
        branchName ??= await this.getBranch();
        const repositories = this.getRepositories();
        const errors: string[] = [];

        for (const [name, path] of repositories) {

            console.log(name, ': checkout to', branchName.value);
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

    getListOfAffectedRepos(): Set<string> {
        return new Set(
            [...this.repositoryStatuses]
                .filter(([, status]) => status.affected)
                .map(([repo]) => repo),
        );
    }


    async getProjectRepo(): Promise<string> {
        const url = await this.git(this.basePath, ['remote', 'get-url', 'origin']);

        return url
            .replace(/\.git$/, '')
            .replace(/^.*github\.com[:/]/, '');
    }

    async getReposByPaths(paths: Set<string>): Promise<Set<string>> {
        const repos = new Set<string>();

        for (const path of paths) {
            const remote = (await this.git(path, [
                'remote',
                'get-url',
                'origin',
            ])).trim();

            const match = remote.match(/github\.com[:/]([^/]+\/[^/.]+?)(?:\.git)?$/);

            if (match) {
                repos.add(match[1]);
            }
        }

        return repos;
    }

    async executeForAll(
        operation: (name: string, path: string) => Promise<unknown>,
        repositories: Map<string, string>,
    ): Promise<void> {
        for (const [name, path] of repositories) {
            await operation(name, path);
        }
    }

    async commit(
        message?: string,
    ): Promise<void> {
        const branchName = await this.getBranch();
        message = message || branchName.value;

        await this.executeForAll(async (name, path) => {
            await this.git(path, ['add', '-A']);

            const staged = await this.git(path, [
                'diff',
                '--cached',
                '--name-only',
            ]);

            if (staged.trim()) {
                await this.git(path, ['commit', '-m', message]);
            } else {
                console.log(`${name}: nothing to commit`);
            }
        }, this.getRepositories());
    }

    async pull(affectedOnly = false): Promise<void> {
        await this.executeForAll(async (name, path) => {
            console.log(`${name}: pulling`);
            if (!this.isCleanStage(path)) {
                console.log(`${name}: skipped (working tree is dirty)`);
                return;
            }

            const branchName = await this.currentBranch(path);

            const remoteBranch = await this.git(path, [
                'ls-remote',
                '--heads',
                'origin',
                `refs/heads/${branchName.value}`,
            ]);

            // console.log('branch=', branchName.value);
            // console.log('remoteBranch=', remoteBranch);

            if (remoteBranch) {
                if (path === '.') {
                    await this.git(path, [
                        '-c', 'submodule.recurse=false',
                        'pull', '--no-recurse-submodules',
                        'origin', branchName.value,
                    ]);
                } else {
                    await this.git(path, ['pull', 'origin', branchName.value]);
                }
            }
        }, this.getRepositories(affectedOnly));
    }

    async push(): Promise<void> {
        await this.executeForAll(async (name, path) => {
            console.log(`${name}: pushing`);
            const branchName = await this.getBranch(path);
            await this.git(path, ['push', 'origin', branchName.value]);
        }, this.getRepositories(true));
    }

    async fetch(): Promise<void> {
        await this.executeForAll(async (name, path) => {
            console.log(`${name}: fetch`);
            const branchName = await this.getBranch(path);
            await this.git(path, ['fetch']);
        }, this.getRepositories());
    }

    private async git(path: string, args: string[]): Promise<string> {
        const {stdout} = await execFileAsync(
            'git',
            args,
            {cwd: resolve(this.projectDir, path)},
        );

        return stdout.trim();
    }
}

export default GitService;
