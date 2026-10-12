import wrapper from "./wrapper";

import ExeciuteUseCase from "../../../application/use-cases/devorc/execute";

export class DevorcController {

    execute = wrapper(async (req, res) => {
        return await this.executeUseCase.execute();
    });

    constructor(
        private readonly executeUseCase: ExecuteUseCase,
    ) {
    }
}

export default DevorcController;
