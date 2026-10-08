import logger from "@shared/logger";
import GrpcService from "../infrastructure/grpc/service";

export class Application {
    constructor(
        private readonly grpcService: GrpcService,
    ) {
    }

    async start(): Promise<void> {
        const shutdown = async () => {
            logger.info("🛑 Shutting down...");

            await this.stop();

            process.exit(0);
        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

        try {
            await this.grpcService.start();
            logger.info(
                '🚀 ServiceTemplate service started',
            );
        } catch (err) {
            logger.error(
                {err},
                '💥 Failed to start ServiceTemplate service',
            );
            process.exit(1);
        }
    }

    async stop() {
        await this.grpcService.stop();
    }
}

export default Application;