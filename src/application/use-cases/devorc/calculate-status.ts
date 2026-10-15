import GithubService from "../../../infrastructure/github/service";
import GitService from "../../../infrastructure/git/service";

export class CalculateStatusUseCase {

    constructor(
        // private readonly issueRepository: IssueRepository,
        private readonly githubService: GithubService,
        private readonly gitService: GitService,
    ) {
    }


    async execute(): Promise<Object> {
        const result = this.gitService.calculateRepositoryStatuses();
        return result;
    }
}


export default CalculateStatusUseCase;
