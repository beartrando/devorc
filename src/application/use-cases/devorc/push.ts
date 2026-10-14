import GithubService from "../../../infrastructure/github/service";
import GitService from "../../../infrastructure/git/service";

export class PushUseCase {

    constructor(

        // private readonly issueRepository: IssueRepository,
        private readonly githubService: GithubService,
        private readonly gitService: GitService,
    ) {
    }


    async execute(): Promise<void> {
        await this.githubService.commitAndPushAndCreatePullRequests();
        this.gitService.commitAndPush();
    }
}


export default PushUseCase;
