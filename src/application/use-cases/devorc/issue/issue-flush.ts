import GithubService from "../../../../infrastructure/github/service";
import GitService from "../../../../infrastructure/git/service";
import BranchName, {DEFAULT_BRANCH_NAME} from "../../../../infrastructure/git/branch/value-objects/branch-name.vo";

export class IssueFlushUseCase {

    constructor(
        // private readonly issueRepository: IssueRepository,
        private readonly githubService: GithubService,
        private readonly gitService: GitService,
    ) {
    }

    async execute(): Promise<void> {
        await this.gitService.checkoutBranches(BranchName.create(DEFAULT_BRANCH_NAME));
    }
}


export default IssueFlushUseCase;
