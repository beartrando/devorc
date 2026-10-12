import {Router, type Router as ExpressRouter} from "express";
import HealthController from "../controllers/health.controller";

export class DevorcRouter {

    readonly router: ExpressRouter;

    constructor(
        private readonly devorcController: HealthController,
    ) {
        this.router = Router();
        this.router.get("/execute", this.devorcController.execute,);
    }
}

export default DevorcRouter;
