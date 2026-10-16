import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import GitService from "../git/service";
import BranchName, {DEFAULT_BRANCH_NAME} from "../git/branch/value-objects/branch-name.vo";

const execFileAsync = promisify(execFile);

export class GithubService {
    private repo?: string;

    constructor(
        private readonly gitService: GitService,
    ) {
    }

    async getRepo(): Promise<string> {
        if (!this.repo) {
            this.repo = await this.gitService.getProjectRepo();
        }

        return this.repo;
    }

    async execute(args: string[]) {
        const {stdout} = await execFileAsync('gh', args);
        return stdout.trim();
    }

    async createOrUpdatePullRequests(
        repos: Set<string>,
        branch: BranchName,
    ): Promise<string[]> {
        const pullRequests: string[] = [];
        const base = BranchName.create(DEFAULT_BRANCH_NAME);

        for (const repo of repos) {
            console.log(repo, ': create PR.')

            const path = await this.gitService.getRepositoryPath(repo);

            if (!path) {
                console.log(`${repo}: local repository not found, skip.`);
                continue;
            }

            const hasDiff = await this.gitService.hasDiff(path, base, branch);

            if (!hasDiff) {
                console.log(
                    `${repo}: no diff between ${base.value} and ${branch.value}, skip PR.`,
                );
                continue;
            }

            const existingPr = await this.execute([
                'pr', 'list',
                '--head', branch.value,
                '--base', 'dev',
                '--repo', repo,
                '--json', 'url',
                '--jq', '.[0].url // empty',
            ]);

            if (existingPr.trim()) {
                pullRequests.push(existingPr.trim());
                continue;
            }

            const url = await this.execute([
                'pr', 'create',
                '--head', branch.value,
                '--base', 'dev',
                '--repo', repo,
                '--title', branch.value,
                '--body', '',
            ]);

            pullRequests.push(url.trim());
        }

        return pullRequests;
    }

    async createIssue(title: string): Promise<string> {
        const result = await this.execute([
            'issue', 'create',
            '--title', title,
            '--repo', await this.gitService.getProjectRepo(),
            '--body', '',
        ]);
        return result;
    }

    async getIssueTitle(id: string): Promise<string> {
        return this.execute([
            'issue', 'view',
            id,
            '--repo', await this.gitService.getProjectRepo(),
            '--json', 'title',
            '--jq', '.title',
        ]);
    }

    // async createOrUpdatePullRequests() {
    //     const { stdout } = await execFileAsync('gh', args);
    //     return stdout.trim();
    // }
    //
    // async createPullRequest(title: string, base: string) {
    //     return this.execute([
    //         'pr', 'create',
    //         '--title', title,
    //         '--base', base,
    //     ]);
    // }
    //
    // async pullRequestExists(branch: string) {
    //     const result = await this.execute([
    //         'pr', 'list',
    //         '--head', branch,
    //         '--json', 'number',
    //     ]);
    //
    //     return JSON.parse(result).length > 0;
    // }
    //
    // async listPullRequests() {
    //     return this.execute([
    //         'pr', 'list',
    //         '--json', 'number,title,state,url,headRefName,baseRefName',
    //     ]);
    // }
    //
    // async listIssues() {
    //     return this.execute([
    //         'issue', 'list',
    //         '--json', 'number,title,state,url,labels',
    //     ]);
    // }
    //
    // async moveIssue(
    //     projectId: string,
    //     itemId: string,
    //     fieldId: string,
    //     optionId: string,
    // ) {
    //     return this.execute([
    //         'project', 'item-edit',
    //         '--id', itemId,
    //         '--project-id', projectId,
    //         '--field-id', fieldId,
    //         '--single-select-option-id', optionId,
    //     ]);
    // }
}

export default GithubService;
