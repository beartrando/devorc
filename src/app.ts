import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

const app = express();
const httpPort = 50051;

app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoints
app.get('/health', (req, res) => {
    res.json({status: 'ok'});
});

app.get('/full-health', (req, res) => {
    res.json({status: 'ok', env: process.env.APP_ENV});
});

app.get('/status', (req, res) => {
    res.json({status: 'ok'});
});

app.get('/livez', (req, res) => {
    res.json({status: 'ok'});
});

app.get('/readyz', (req, res) => {
    res.json({status: 'ok'});
});

// Proxy endpoint - returns unavailable if orchestration not configured
app.get('/gateway/proxy', (req, res) => {
    res.status(503).json({error: 'Proxy service unavailable - orchestration client not configured'});
});

app.listen(httpPort, '0.0.0.0', () => {
    console.log(`🌐 HTTP started on port ${httpPort}`);
});