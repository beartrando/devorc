import {Router, type Router as ExpressRouter} from "express";
import DevorcController from "../controllers/devorc.controller";

export class DevorcRouter {

    readonly router: ExpressRouter;

    constructor(
        private readonly devorcController: DevorcController,
    ) {
        this.router = Router();
        this.router.get("/execute", this.devorcController.execute,);
    }
}

export default DevorcRouter;
