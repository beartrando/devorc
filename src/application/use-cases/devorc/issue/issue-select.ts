import GithubService from "../../../../infrastructure/github/service";
import GitService from "../../../../infrastructure/git/service";

export class IssueSelectUseCase {

    constructor(

        // private readonly issueRepository: IssueRepository,
        private readonly githubService: GithubService,
        private readonly gitService: GitService,
    ) {
    }


    async execute(): Promise<Object> {
        return {
            status: 'IssueSelectUseCase',
        };

    }
}


export default IssueSelectUseCase;
