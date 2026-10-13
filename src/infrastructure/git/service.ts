import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import BranchName, {DEFAULT_BRANCH_NAME} from "./branch/value-objects/branch-name.vo";

const execFileAsync = promisify(execFile);

type RepositoryOptions = {
    extra?: boolean;
    module?: boolean;
};

export class GitService {
    private readonly serviceRepositories = new Map<string, string>();
    private readonly extraRepositories = new Map<string, string>();
    private readonly moduleRepositories = new Map<string, string>();
    private branchName = BranchName.create(DEFAULT_BRANCH_NAME);

    constructor(config: {
        gitServiceRepos: string[];
        gitExtraRepos: string[];
        gitModuleRepos: string[];
    }) {
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

    getRepositories({extra = false, module = false,}: RepositoryOptions = {}): Map<string, string> {
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

    private async git(
        path: string,
        args: string[],
    ): Promise<string> {
        const {stdout} = await execFileAsync(
            'git',
            args,
            {cwd: path},
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

    async checkoutBranches(options: RepositoryOptions = {}): Promise<void> {
        const repositories = this.getRepositories(options);
        const errors: string[] = [];
        for (const [name, path] of repositories) {
            try {
                const currentBranch = await this.git(path, ['branch', '--show-current',]);
                if (currentBranch !== this.branchName.value) {
                    try {
                        await this.git(path, ['switch', this.branchName.value,]);
                    } catch {
                        // The target branch may exist only on the remote.
                        await this.git(path, ['switch', '--track', '-c', this.branchName.value, `origin/${this.branchName.value}`,]);
                    }
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                errors.push(`${name}: ${message}`);
            }
        }
        if (errors.length > 0) {
            throw new Error(`Failed to switch repositories to branch "${this.branchName.value}":\n${errors.join('\n')}`,);
        }
    }


    async commit(
        message?: string,
        options: RepositoryOptions = {},
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

    async pull(options: RepositoryOptions = {}): Promise<void> {
        await this.executeForAll(async (name, path) => {
            console.log(`${name}: pulling`);
            await this.git(path, ['pull']);
        }, this.getRepositories(options));
    }

    async push(options: RepositoryOptions = {}): Promise<void> {
        await this.executeForAll(async (name, path) => {
            console.log(`${name}: pushing`);
            await this.git(path, ['push']);
        }, this.getRepositories(options));
    }

    async commitAndPush(
        message?: string,
        options: RepositoryOptions = {},
    ): Promise<void> {
        message = message || this.branchName.value
        // Stage 1: verify and switch all repositories.
        await this.checkoutBranches(options);

        // Stage 2: commit changes.
        await this.commit(message, options);

        // Stage 3: pull remote changes.
        await this.pull(options);

        // Stage 4: push local commits.
        await this.push(options);
    }

    async checkoutAndPull(
        options: RepositoryOptions = {},
    ): Promise<void> {
        // Stage 1: verify and switch all repositories.
        await this.checkoutBranches(options);

        // Stage 3: pull remote changes.
        await this.pull(options);

    }

    async park(
        message?: string,
        options: RepositoryOptions = {},
    ): Promise<void> {
        message = message || this.branchName.value;
        // Stage 1: verify and switch all repositories.
        await this.commitAndPush(message, options);

        // Stage 3: pull remote changes.
        this.setBranch(DEFAULT_BRANCH_NAME);
        await this.checkoutBranches(options);
        await this.pull(options);


    }
}

export default GitService;
