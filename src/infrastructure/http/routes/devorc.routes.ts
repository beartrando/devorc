import {Router, type Router as ExpressRouter} from "express";
import DevorcController from "../controllers/devorc.controller";

export class DevorcRouter {

    readonly router: ExpressRouter;

    constructor(
        private readonly devorcController: DevorcController,
    ) {
        this.router = Router();
        this.router.post("/issue/create", this.devorcController.issueCreate,);
        this.router.post("/issue/flush", this.devorcController.issueFlush,);
        this.router.post("/issue/select", this.devorcController.issueSelect,);
        this.router.post("/park", this.devorcController.park,);
        this.router.post("/pull", this.devorcController.pull,);
        this.router.post("/push", this.devorcController.push,);
        this.router.post("/refresh-status", this.devorcController.refreshStatus,);
    }
}

export default DevorcRouter;
