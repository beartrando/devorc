import GithubService from "../../../../infrastructure/github/service";
import GitService from "../../../../infrastructure/git/service";

export class IssueCreateUseCase {

    constructor(

        // private readonly issueRepository: IssueRepository,
        private readonly githubService: GithubService,
        private readonly gitService: GitService,
    ) {
    }

    async execute(title: string): Promise<Object> {
        return {
            status: 'IssueCreateUseCase',
            title,
        };
    }
}


export default IssueCreateUseCase;
