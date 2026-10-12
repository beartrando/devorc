import logger from "@shared/logger";
import HttpServerService from "../infrastructure/http/server.service";

export class Application {
    private readonly httpService: HttpServerService;

    constructor(httpPort: number) {
        private readonly httpService: HttpServerService,
        private readonly dbService: DbService,
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
            await this.dbService.stop();
            await this.httpService.start();

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
        await this.httpService.stop();
        await this.dbService.stop();
    }
}

export default Application;