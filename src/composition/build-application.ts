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
import RefreshStatusUseCase from "../application/use-cases/devorc/refresh-status";
import PullUseCase from "../application/use-cases/devorc/pull";
import gitConfig from "../infrastructure/git/config";
import Cli from "../infrastructure/cli/cli";


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
const gitService = new GitService(gitConfig);

const issueCreateUseCase = new IssueCreateUseCase(githubService, gitService);
const issueFlushUseCase = new IssueFlushUseCase(githubService, gitService);
const issueSelectUseCase = new IssueSelectUseCase(githubService, gitService);
const parkUseCase = new ParkUseCase(githubService, gitService);
const pullUseCase = new PullUseCase(githubService, gitService);
const pushUseCase = new PushUseCase(githubService, gitService);
const refreshStatusUseCase = new RefreshStatusUseCase(githubService, gitService);

const devorcController = new DevorcController(
    issueCreateUseCase,
    issueFlushUseCase,
    issueSelectUseCase,
    parkUseCase,
    pullUseCase,
    pushUseCase,
    refreshStatusUseCase,
);

const healthRouter = new HealthRouter(healthController);
const devorcRouter = new DevorcRouter(devorcController);


const httpService = new HttpServerService(httpConfig.port);

httpService.addRouter('/', healthRouter.router);
httpService.addRouter('/devorc', devorcRouter.router);

function buildApplication(): Application {

    const application = new Application(dbService, httpService);

    return application;
}

export function buildCli(): Cli {

    const cli = new Cli(
        gitService,
        issueCreateUseCase,
        issueFlushUseCase,
        issueSelectUseCase,
        parkUseCase,
        pullUseCase,
        pushUseCase,
        refreshStatusUseCase
    );

    return cli;
}

export default buildApplication;
