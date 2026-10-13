import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export class GithubService {
    async execute(args: string[]) {
        const { stdout } = await execFileAsync('gh', args);
        return stdout.trim();
    }

    async createIssue(title: string) {
        return this.execute([
            'issue', 'create',
            '--title', title,
        ]);
    }

    async createPullRequest(title: string, base: string) {
        return this.execute([
            'pr', 'create',
            '--title', title,
            '--base', base,
        ]);
    }

    async pullRequestExists(branch: string) {
        const result = await this.execute([
            'pr', 'list',
            '--head', branch,
            '--json', 'number',
        ]);

        return JSON.parse(result).length > 0;
    }

    async listPullRequests() {
        return this.execute([
            'pr', 'list',
            '--json', 'number,title,state,url,headRefName,baseRefName',
        ]);
    }

    async listIssues() {
        return this.execute([
            'issue', 'list',
            '--json', 'number,title,state,url,labels',
        ]);
    }

    async moveIssue(
        projectId: string,
        itemId: string,
        fieldId: string,
        optionId: string,
    ) {
        return this.execute([
            'project', 'item-edit',
            '--id', itemId,
            '--project-id', projectId,
            '--field-id', fieldId,
            '--single-select-option-id', optionId,
        ]);
    }
}

export default GithubService;
