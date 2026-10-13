import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import BranchName, {DEFAULT_BRANCH_NAME} from "./branch/value-objects/branch-name.vo";
import {resolve} from 'node:path';

const execFileAsync = promisify(execFile);

type RepositoryOptions = {
    extra?: boolean;
    module?: boolean;
};

type RepositoryStatus = {
    branch: string;
    workingTree: 'clean' | 'dirty';
    origin: 'ahead' | 'behind' | 'diverged' | 'up-to-date' | 'unknown';
};

export class GitService {
    private readonly serviceRepositories = new Map<string, string>();
    private readonly extraRepositories = new Map<string, string>();
    private readonly moduleRepositories = new Map<string, string>();
    private branchName = BranchName.create(DEFAULT_BRANCH_NAME);
    private mode: RepositoryOptions = {};
    private readonly repositoryStatuses = new Map<string, RepositoryStatus>();

    private readonly projectDir: string;

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

    setMode(options: RepositoryOptions): void {
        this.mode = {...options};
    }

    getRepositories(options?: RepositoryOptions): Map<string, string> {
        const {extra = false, module = false} = options ?? this.mode;
        const repositories = new Map(this.serviceRepositories);

        if (extra) {
            for (const [name, path] of this.extraRepositories) {
                repositories.set(name, path);
            }
        }

        if (module) {
            for (const [name, path] of this.moduleRepositories) {
                repositories.set(name, path);
            }
        }

        return repositories;
    }

    setBranch(name: string): void {
        this.branchName = BranchName.create(name);
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

    async refreshRepositoryStatuses(options?: RepositoryOptions): Promise<void> {
        const repositories = this.getRepositories(options);

        for (const [name, path] of repositories) {
            try {
                const counts = await this.git(path, [
                    'fetch',
                ]);
            } catch {
                console.error('smth went wrong. git was not updated')
            }

        }
    }

    async calculateRepositoryStatuses(options?: RepositoryOptions): Promise<Map<string, RepositoryStatus>> {

        const repositories = this.getRepositories(options);

        for (const [name, path] of repositories) {
            try {
                const branch = await this.git(path, ['branch', '--show-current']);

                const workingTree = await this.git(path, ['status', '--porcelain']);

                let origin: RepositoryStatus['origin'] = 'unknown';

                try {
                    const counts = await this.git(path, [
                        'rev-list',
                        '--left-right',
                        '--count',
                        `HEAD...origin/${branch}`,
                    ]);

                    const [ahead, behind] = counts.split(/\s+/).map(Number);

                    if (ahead > 0 && behind > 0) {
                        origin = 'diverged';
                    } else if (ahead > 0) {
                        origin = 'ahead';
                    } else if (behind > 0) {
                        origin = 'behind';
                    } else {
                        origin = 'up-to-date';
                    }
                } catch {
                    origin = 'unknown';
                }

                this.repositoryStatuses.set(name, {
                    branch,
                    workingTree: workingTree ? 'dirty' : 'clean',
                    origin,
                });
            } catch (error) {
                console.error(`Failed to check repository "${name}":`, error);

                this.repositoryStatuses.set(name, {
                    branch: 'ERROR',
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

    async executeForAll(
        operation: (name: string, path: string) => Promise<unknown>,
        repositories: Map<string, string>,
    ): Promise<void> {
        for (const [name, path] of repositories) {
            await operation(name, path);
        }
    }

    async checkoutBranches(options?: RepositoryOptions): Promise<void> {
        const repositories = this.getRepositories(options);
        const errors: string[] = [];

        for (const [name, path] of repositories) {
            try {
                const currentBranch = await this.git(path, [
                    'branch',
                    '--show-current',
                ]);

                if (currentBranch !== this.branchName.value) {
                    try {
                        await this.git(path, [
                            'switch',
                            this.branchName.value,
                        ]);
                    } catch {
                        await this.git(path, [
                            'switch',
                            '--track',
                            '-c',
                            this.branchName.value,
                            `origin/${this.branchName.value}`,
                        ]);
                    }
                }
            } catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : String(error);

                errors.push(`${name}: ${message}`);
            }
        }

        if (errors.length > 0) {
            throw new Error(
                `Failed to switch repositories to branch "${this.branchName.value}":\n${errors.join('\n')}`,
            );
        }
    }

    async commit(
        message?: string,
        options?: RepositoryOptions,
    ): Promise<void> {
        message = message || this.branchName.value;

        await this.executeForAll(async (name, path) => {
            await this.git(path, ['add', '-A']);

            const status = await this.git(path, [
                'status',
                '--porcelain',
            ]);

            if (status) {
                await this.git(path, ['commit', '-m', message]);
            } else {
                console.log(`${name}: nothing to commit`);
            }
        }, this.getRepositories(options));
    }

    async pull(options?: RepositoryOptions): Promise<void> {
        await this.executeForAll(async (name, path) => {
            console.log(`${name}: pulling`);
            await this.git(path, ['pull']);
        }, this.getRepositories(options));
    }

    async push(options?: RepositoryOptions): Promise<void> {
        await this.executeForAll(async (name, path) => {
            console.log(`${name}: pushing`);
            await this.git(path, ['push']);
        }, this.getRepositories(options));
    }

    async commitAndPush(
        message?: string,
        options?: RepositoryOptions,
    ): Promise<void> {
        message = message || this.branchName.value;

        await this.checkoutBranches(options);
        await this.commit(message, options);
        await this.pull(options);
        await this.push(options);
    }

    async checkoutAndPull(options?: RepositoryOptions): Promise<void> {
        await this.checkoutBranches(options);
        await this.pull(options);
    }

    async park(
        message?: string,
        options?: RepositoryOptions,
    ): Promise<void> {
        message = message || this.branchName.value;

        await this.commitAndPush(message, options);

        this.setBranch(DEFAULT_BRANCH_NAME);
        await this.checkoutBranches(options);
        await this.pull(options);
    }
}

export default GitService;
