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
        // return this.gitService.checkStatus
        return {
            status: 'RefreshStatusUseCase',
        };

    }
}


export default RefreshStatusUseCase;
