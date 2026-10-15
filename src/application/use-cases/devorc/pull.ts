import GithubService from "../../../infrastructure/github/service";
import GitService from "../../../infrastructure/git/service";

export class CheckoutUseCase {

    constructor(
        // private readonly issueRepository: IssueRepository,
        private readonly githubService: GithubService,
        private readonly gitService: GitService,
    ) {
    }


    async execute(): Promise<void> {
        await this.gitService.pull();
    }
}


export default CheckoutUseCase;
