import GithubService from "../../../../infrastructure/github/service";
import GitService from "../../../../infrastructure/git/service";
import logger from "@shared/logger";

export class IssueToReviewUseCase {

    constructor(
        // private readonly issueRepository: IssueRepository,
        private readonly githubService: GithubService,
        private readonly gitService: GitService,
    ) {
    }


    async execute(): Promise< string[]> {

        const branchName = await this.gitService.getBranch();

        await this.gitService.checkoutBranches(branchName);
        await this.gitService.commit(branchName.value);
        await this.gitService.pull();
        await this.gitService.push();

        const repos = this.gitService.getListOfAffectedRepos();

        const result = await this.githubService.createOrUpdatePullRequests(repos, branchName);
        
        console.log(result);

        return result;

        // return result;
    }
}


export default IssueToReviewUseCase;
