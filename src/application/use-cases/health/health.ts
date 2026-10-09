import * as healthProto from "../../../contracts/proto/common/health";
import appConfig from "../../../infrastructure/app/config";

export class HealthUseCase {
    async execute(): Promise<healthProto.HealthReport> {
        return {
            service: appConfig.appName,
            status: healthProto.HealthStatus.HEALTH_STATUS_OK,
            components: {},
            timestamp: new Date(),
        };
    }
}

export default HealthUseCase;
