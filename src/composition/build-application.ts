import HealthUseCase from "../application/use-cases/health/health";
import StatusUseCase from "../application/use-cases/health/status";
import LivezUseCase from "../application/use-cases/health/livez";
import ReadyzUseCase from "../application/use-cases/health/readyz";
import HealthHandler from "../infrastructure/grpc/handlers/health.handler";
import GrpcService from "../infrastructure/grpc/service";
import HealthAggregator from "../infrastructure/grpc/clients/health.aggregator";
import grpcConfig from "../infrastructure/grpc/config/config";
import httpConfig from "../infrastructure/http/configs/http.server.config";
import FullHealthUseCase from "../application/use-cases/health/full-health";
import HealthController from "../infrastructure/http/controllers/health.controller";
import HttpServerService from "../infrastructure/http/server.service";
import OrchestrationService from "../infrastructure/orchestration/service";
import OrchestrationClient from "../infrastructure/grpc/clients/orchestration.client";
import ProxyController from "../infrastructure/http/controllers/proxy-controller";
import microservicesConfig from "../infrastructure/grpc/config/microservices.config";
import GatewayRouter from "../infrastructure/http/routes/health.routes";
import Application from "../application/application";

function buildApplication() {

    const healthAggregator = new HealthAggregator();

    const healthUseCase = new HealthUseCase(healthAggregator);
    const statusUseCase = new StatusUseCase;
    const livezUseCase = new LivezUseCase;
    const readyzUseCase = new ReadyzUseCase;

    const healthController = new HealthController(
        healthUseCase,
        statusUseCase,
        livezUseCase,
        readyzUseCase,
    );

    const devorcRouter = new DevorcRouter(healthController);




    const httpService = new HttpServerService(httpConfig.port, gatewayRouter, proxyController);

    const application = new Application(httpService);

    return application;
}

export default buildApplication;




