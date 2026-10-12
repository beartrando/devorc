import HealthUseCase from "../application/use-cases/health/health";
import StatusUseCase from "../application/use-cases/health/status";
import LivezUseCase from "../application/use-cases/health/livez";
import ReadyzUseCase from "../application/use-cases/health/readyz";
import httpConfig from "../infrastructure/http/configs/http.server.config";
import HealthController from "../infrastructure/http/controllers/health.controller";
import HttpServerService from "../infrastructure/http/server.service";
import Application from "../application/application";
import DbService from "../infrastructure/db/service";
import DevorcRouter from "../infrastructure/http/routes/devorc.routes";
import {HealthRouter} from "../infrastructure/http/routes/health.routes";
import DevorcController from "../infrastructure/http/controllers/devorc.controller";
import ExecuteUseCase from "../application/use-cases/devorc/execute";

function buildApplication(): Application {

    const dbService = new DbService();

    const healthUseCase = new HealthUseCase(dbService);
    const statusUseCase = new StatusUseCase;
    const livezUseCase = new LivezUseCase;
    const readyzUseCase = new ReadyzUseCase;

    const healthController = new HealthController(
        healthUseCase,
        statusUseCase,
        livezUseCase,
        readyzUseCase,
    );

    const executeUseCase = new ExecuteUseCase();

    const devorcController = new DevorcController(executeUseCase);

    const healthRouter = new HealthRouter(healthController);
    const devorcRouter = new DevorcRouter(devorcController);


    const httpService = new HttpServerService(httpConfig.port);

    httpService.addRouter('health', healthRouter.router);
    httpService.addRouter('/', devorcRouter.router);

    const application = new Application(dbService, httpService);

    return application;
}

export default buildApplication;
