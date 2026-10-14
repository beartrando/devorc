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
        const brancName = await this.githubService.createIssue(title);
        this.gitService.setBranch(brancName);
        this.gitService.checkoutBaseBranch(brancName);
    }
}


export default IssueCreateUseCase;
