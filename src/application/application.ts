import logger from "@shared/logger";
import GrpcService from "../infrastructure/grpc/service";
import DbService from "../infrastructure/db/service";
import JobService from "../infrastructure/job/service";
import MessageService from "../infrastructure/message/service";

export class Application {
    constructor(
        private readonly dbService: DbService,
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
            await this.dbService.start();
            logger.info(
                '🚀 Devorc service started',
            );
        } catch (err) {
            logger.error(
                {err},
                '💥 Failed to start Devorc service',
            );
            process.exit(1);
        }
    }

    async stop() {
        await this.dbService.stop();
    }
}

export default Application;
