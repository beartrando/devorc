import {Request, Response} from "express";

export default function wrapper<T>(fn: (req: Request, res: Response) => Promise<T>) {
    return async (req: Request, res: Response) => {
        try {
            const response = await fn(req, res);

            // Если controller сам отправил response — ничего не делаем
            if (res.headersSent) {
                return;
            }

            res.status(200).json(response);
        } catch (err) {
            if (res.headersSent) {
                return;
            }

            const message = err instanceof Error ? err.message : "Unknown error";

            res.status(500).json({error: message});
        }
    };
}
