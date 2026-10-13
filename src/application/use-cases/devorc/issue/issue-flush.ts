import GithubService from "../../../../infrastructure/github/service";
import GitService from "../../../../infrastructure/git/service";

export class IssueFlushUseCase {

    constructor(

        // private readonly issueRepository: IssueRepository,
        private readonly githubService: GithubService,
        private readonly gitService: GitService,
    ) {
    }

    async execute(): Promise<Object> {
        return {
            status: 'IssueFlushUseCase',
        };

    }
}


export default IssueFlushUseCase;
