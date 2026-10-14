import GithubService from "../../../../infrastructure/github/service";
import GitService from "../../../../infrastructure/git/service";

export class IssueCreateUseCase {

    constructor(

        // private readonly issueRepository: IssueRepository,
        private readonly githubService: GithubService,
        private readonly gitService: GitService,
    ) {
    }

    async execute(title: string): Promise<void> {
        const issueId = await this.githubService.createIssue(title);
        const brancName = this.gitService.createBranchName(issueId, title)
        await this.gitService.checkoutBranches(brancName);
    }
}


export default IssueCreateUseCase;
