import HealthController from "../infrastructure/http/controllers/gateway.controller";
import GatewayRouter from "../infrastructure/http/routes/health.routes";
import HttpServerService from "../infrastructure/http/server.service";

function buildApplication() {
    const healthController = new HealthController(
        // Simple health use cases - inline implementations
    );

    const gatewayRouter = new GatewayRouter(healthController);

    const httpService = new HttpServerService(50051);

    return httpService;
}

export default buildApplication;