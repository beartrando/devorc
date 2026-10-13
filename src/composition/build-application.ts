import HealthUseCase from "../application/use-cases/health/health";
import StatusUseCase from "../application/use-cases/health/status";
import LivezUseCase from "../application/use-cases/health/livez";
import ReadyzUseCase from "../application/use-cases/health/readyz";
import httpConfig from "../infrastructure/http/configs/http.server.config";
import HealthController from "../infrastructure/http/controllers/health.controller";
import HttpServerService from "../infrastructure/http/server.service";
import Application from "../application/application";
import DbService from "../infrastructure/db/service";
import GithubService from "../infrastructure/github/service";
import GitService from "../infrastructure/git/service";
import DevorcRouter from "../infrastructure/http/routes/devorc.routes";
import {HealthRouter} from "../infrastructure/http/routes/health.routes";
import DevorcController from "../infrastructure/http/controllers/devorc.controller";
import IssueFlushUseCase from "../application/use-cases/devorc/issue/issue-flush";
import IssueSelectUseCase from "../application/use-cases/devorc/issue/issue-select";
import ParkUseCase from "../application/use-cases/devorc/park";
import PushUseCase from "../application/use-cases/devorc/push";
import IssueCreateUseCase from "../application/use-cases/devorc/issue/issue-create";
import IssueStatusUseCase from "../application/use-cases/devorc/status";
import PullUseCase from "../application/use-cases/devorc/pull";

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

    const githubService = new GithubService();
    const gitService = new GitService();

    const issueCreateUseCase = new IssueCreateUseCase();
    const issueFlushUseCase = new IssueFlushUseCase(githubService, gitService);
    const issueSelectUseCase = new IssueSelectUseCase();
    const parkUseCase = new ParkUseCase();
    const pullUseCase = new PullUseCase();
    const pushUseCase = new PushUseCase();
    const issueStatusUseCase = new IssueStatusUseCase();

    const devorcController = new DevorcController(
        issueCreateUseCase,
        issueFlushUseCase,
        issueSelectUseCase,
        parkUseCase,
        pullUseCase,
        pushUseCase,
        issueStatusUseCase,
    );

    const healthRouter = new HealthRouter(healthController);
    const devorcRouter = new DevorcRouter(devorcController);


    const httpService = new HttpServerService(httpConfig.port);

    httpService.addRouter('/', healthRouter.router);
    httpService.addRouter('/devorc', devorcRouter.router);

    const application = new Application(dbService, httpService);

    return application;
}

export default buildApplication;
