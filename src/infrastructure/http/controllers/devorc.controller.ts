import wrapper from "./wrapper";
import RefreshStatusUseCase from "../../../application/use-cases/devorc/refresh-status";
import IssueCreateUseCase from "../../../application/use-cases/devorc/issue/issue-create";
import IssueFlushUseCase from "../../../application/use-cases/devorc/issue/issue-flush";
import IssueSelectUseCase from "../../../application/use-cases/devorc/issue/issue-select";
import ParkUseCase from "../../../application/use-cases/devorc/park";
import PullUseCase from "../../../application/use-cases/devorc/pull";
import PushUseCase from "../../../application/use-cases/devorc/push";

export class DevorcController {

    issueCreate = wrapper(async (req, res) => {
        const { title } = req.body ?? {};
        return await this.issueCreateUseCase.execute(title);
    });

    issueFlush = wrapper(async () => {
        return await this.issueFlushUseCase.execute();
    });
    issueSelect = wrapper(async () => {
        return await this.issueSelectUseCase.execute();
    });
    park = wrapper(async () => {
        return await this.parkUseCase.execute();
    });
    pull = wrapper(async () => {
        return await this.pullUseCase.execute();
    });
    push = wrapper(async () => {
        return await this.pushUseCase.execute();
    });
    refreshStatus = wrapper(async () => {
        return await this.refreshStatusUseCase.execute();
    });

    constructor(
        private readonly issueCreateUseCase: IssueCreateUseCase,
        private readonly issueFlushUseCase: IssueFlushUseCase,
        private readonly issueSelectUseCase: IssueSelectUseCase,
        private readonly parkUseCase: ParkUseCase,
        private readonly pullUseCase: PullUseCase,
        private readonly pushUseCase: PushUseCase,
        private readonly refreshStatusUseCase: RefreshStatusUseCase,
    ) {
    }


}

export default DevorcController;
