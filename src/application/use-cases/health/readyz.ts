import {ReadyStatus} from "../../../contracts/proto/common/health";

export class ReadyzUseCase {
    async execute(): Promise<ReadyStatus> {
        return {ready: true};
    }
}

export default ReadyzUseCase;
