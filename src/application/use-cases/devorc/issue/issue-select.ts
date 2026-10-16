import GithubService from "../../../../infrastructure/github/service";
import GitService from "../../../../infrastructure/git/service";

export class IssueSelectUseCase {

    constructor(
        // private readonly issueRepository: IssueRepository,
        private readonly githubService: GithubService,
        private readonly gitService: GitService,
    ) {
    }


    async execute(issueId: string): Promise<void> {
        const title = await this.githubService.getIssueTitle(issueId);
        const branchName = this.gitService.createBranchName(issueId, title);
        await this.gitService.fetch();
        await this.gitService.checkoutBranches(branchName);
        await this.gitService.pull();
    }
}


export default IssueSelectUseCase;
