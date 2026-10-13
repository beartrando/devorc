import GithubService from "../../../infrastructure/github/service";
import GitService from "../../../infrastructure/git/service";

export class RefreshStatusUseCase {

    constructor(

        // private readonly issueRepository: IssueRepository,
        private readonly githubService: GithubService,
        private readonly gitService: GitService,
    ) {
    }


    async execute(): Promise<Object> {
        const result = this.gitService.checkRepositoryStatuses();
        return result;
    }
}


export default RefreshStatusUseCase;
