import appConfig from "../../../infrastructure/app/config";
import {ServiceStatus} from "../../../contracts/proto/common/health";

const startedAt = Date.now();

export class StatusUseCase {
    async execute(): Promise<ServiceStatus> {
        const uptimeMs = Date.now() - startedAt;

        return {
            name: appConfig.appName,
            version: appConfig.appVersion,
            env: appConfig.appEnv,
            uptime: {
                seconds: Math.floor(uptimeMs / 1000),
                nanos: (uptimeMs % 1000) * 1_000_000,
            },
            timestamp: new Date(),
        };

    }
}


export default StatusUseCase;
