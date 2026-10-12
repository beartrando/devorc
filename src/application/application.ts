import logger from "@shared/logger";
import HttpServerService from "../infrastructure/http/server.service";
import DbService from "../infrastructure/db/service";

export class Application {
    constructor(
        private readonly dbService: DbService,
        private readonly httpService: HttpServerService,
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
            await this.httpService.start();

            logger.info(
                '🚀 Gateway service started',
            );
        } catch (err) {
            logger.error(
                {err},
                '💥 Failed to start Gateway service',
            );
            process.exit(1);
        }
    }

    async stop() {
        await this.httpService.stop();
        await this.dbService.stop();
    }
}

export default Application;
