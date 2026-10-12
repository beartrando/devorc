import {LiveStatus} from "../../../contracts/proto/common/health";

export class LivezUseCase {
    async execute(): Promise<LiveStatus> {
        return {
            live: true,
        };
    }
}

export default LivezUseCase;
