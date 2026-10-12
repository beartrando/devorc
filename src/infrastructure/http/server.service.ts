import logger from "@shared/logger";
import express, {Express} from 'express';
import morgan from 'morgan';
import cors from 'cors';

export class HttpServerService {
    private readonly app: Express;
    private server?: NodeJS.Server;

    constructor(private readonly httpPort: number) {

        this.app = express();
        this.app.use(express.json());
        this.app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
        this.app.use(cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }));

        // Health check endpoints
        this.app.get('/health', (req, res) => {
            res.json({status: 'ok'});
        });

        this.app.get('/full-health', (req, res) => {
            res.json({status: 'ok', env: process.env.APP_ENV});
        });

        this.app.get('/status', (req, res) => {
            res.json({status: 'ok'});
        });

        this.app.get('/livez', (req, res) => {
            res.json({status: 'ok'});
        });

        this.app.get('/readyz', (req, res) => {
            res.json({status: 'ok'});
        });

        // Proxy endpoint - returns unavailable if orchestration not configured
        this.app.get('/.well-known/proxy', (req, res) => {
            res.status(503).json({error: 'Proxy service unavailable - orchestration client not configured'});
        });
    }

    async start(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.server = this.app.listen(this.httpPort, "0.0.0.0", () => {
                logger.info(`🌐 HTTP started on port ${this.httpPort}`);
                resolve();
            });
        });
    }

    async stop(): Promise<void> {
        if (!this.server) return;

        await new Promise<void>((resolve, reject) => {
            this.server!.close(err => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}

export default HttpServerService;