import wrapper from "./wrapper";
import RefreshStatusUseCase from "../../../application/use-cases/devorc/refresh-status";
import IssueCreateUseCase from "../../../application/use-cases/devorc/issue/issue-create";
import IssueFlushUseCase from "../../../application/use-cases/devorc/issue/issue-flush";
import IssueSelectUseCase from "../../../application/use-cases/devorc/issue/issue-select";
import ParkUseCase from "../../../application/use-cases/devorc/checkout";
import CheckoutUseCase from "../../../application/use-cases/devorc/pull";
import IssueToReviewUseCase from "../../../application/use-cases/devorc/issue/issue-to-review";

export class DevorcController {

    issueCreate = wrapper(async (req, res) => {
        const {title} = req.body ?? {};
        return await this.issueCreateUseCase.execute(title);
    });

    issueFlush = wrapper(async () => {
        return await this.issueFlushUseCase.execute();
    });
    issueSelect = wrapper(async () => {
        return await this.issueSelectUseCase.execute('1');
    });
    park = wrapper(async () => {
        return await this.parkUseCase.execute();
    });
    pull = wrapper(async () => {
        return await this.pullUseCase.execute();
    });
    issueToReview = wrapper(async () => {
        return await this.issueToReviewUseCase.execute();
    });
    refreshStatus = wrapper(async () => {
        return await this.refreshStatusUseCase.execute();
    });

    constructor(
        private readonly issueCreateUseCase: IssueCreateUseCase,
        private readonly issueFlushUseCase: IssueFlushUseCase,
        private readonly issueSelectUseCase: IssueSelectUseCase,
        private readonly parkUseCase: ParkUseCase,
        private readonly pullUseCase: CheckoutUseCase,
        private readonly issueToReviewUseCase: IssueToReviewUseCase,
        private readonly refreshStatusUseCase: RefreshStatusUseCase,
    ) {
    }


}

export default DevorcController;
