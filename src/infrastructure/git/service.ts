import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export class GitService {
    private readonly repositories = new Map<string, string>();

    addRepository(name: string, path: string): void {
        this.repositories.set(name, path);
    }

    removeRepository(name: string): boolean {
        return this.repositories.delete(name);
    }

    listRepositories(): Array<{ name: string; path: string }> {
        return Array.from(this.repositories, ([name, path]) => ({
            name,
            path,
        }));
    }

    async executeForAll(
        operation: (name: string, path: string) => Promise<unknown>,
    ): Promise<void> {
        for (const [name, path] of this.repositories) {
            await operation(name, path);
        }
    }

    async pull(): Promise<void> {
        await this.executeForAll(async (_, path) => {
            await this.git(path, ['pull']);
        });
    }

    async push(): Promise<void> {
        await this.executeForAll(async (_, path) => {
            await this.git(path, ['push']);
        });
    }

    async isEqualToOrigin(path: string): Promise<boolean> {
        await this.git(path, ['fetch', 'origin']);

        const branch = await this.git(path, [
            'branch',
            '--show-current',
        ]);

        const local = await this.git(path, [
            'rev-parse',
            'HEAD',
        ]);

        const remote = await this.git(path, [
            'rev-parse',
            `origin/${branch}`,
        ]);

        return local === remote;
    }

    async isDevBranch(path: string): Promise<boolean> {
        const branch = await this.git(path, [
            'branch',
            '--show-current',
        ]);

        return branch === 'dev';
    }

    async isStagingClean(path: string): Promise<boolean> {
        const status = await this.git(path, [
            'status',
            '--porcelain',
        ]);

        return status === '';
    }

    async switchToDev(path: string): Promise<void> {
        await this.git(path, ['switch', 'dev']);
    }

    async promoteDevToUat(path: string): Promise<void> {
        await this.git(path, ['switch', 'uat']);
        await this.git(path, ['merge', 'dev']);
    }

    private async git(
        path: string,
        args: string[],
    ): Promise<string> {
        const { stdout } = await execFileAsync(
            'git',
            args,
            { cwd: path },
        );

        return stdout.trim();
    }
}

export default GitService;
