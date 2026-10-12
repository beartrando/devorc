import * as healthProto from "../../../contracts/proto/common/health";
import DbService from "../../../infrastructure/db/service";
import appConfig from "../../../infrastructure/app/config";

export class HealthUseCase {
    constructor(
        private readonly dbService: DbService,
    ) {
    }

    async execute(): Promise<healthProto.HealthReport> {
        const [dbOk] = await Promise.all([this.dbService.check()]);

        const components = {
            db: dbOk,
        };

        return {
            service: appConfig.appName,
            status: this.toHealthStatus(
                Object.values(components).every(Boolean),
            ),
            components: Object.fromEntries(
                Object.entries(components).map(([name, ok]) => [
                    name,
                    this.toHealthStatus(ok),
                ]),
            ),
            timestamp: new Date(),
        };
    }

    private toHealthStatus(ok: boolean): healthProto.HealthStatus {
        return ok
            ? healthProto.HealthStatus.HEALTH_STATUS_OK
            : healthProto.HealthStatus.HEALTH_STATUS_FAIL;
    }
}

export default HealthUseCase;
