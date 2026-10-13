import {Router, type Router as ExpressRouter} from "express";
import DevorcController from "../controllers/devorc.controller";

export class DevorcRouter {

    readonly router: ExpressRouter;

    constructor(
        private readonly devorcController: DevorcController,
    ) {
        this.router = Router();
        this.router.get("/issue/create", this.devorcController.issueCreate,);
        this.router.get("/issue/flush", this.devorcController.issueFlush,);
        this.router.get("/issue/select", this.devorcController.issueSelect,);
        this.router.get("/park", this.devorcController.park,);
        this.router.get("/pull", this.devorcController.pull,);
        this.router.get("/push", this.devorcController.push,);
        this.router.get("/status", this.devorcController.status,);
    }
}

export default DevorcRouter;
