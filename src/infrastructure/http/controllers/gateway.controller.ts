import wrapper from "./wrapper";

export class HealthController {

    health = wrapper(async (req, res) => {
        return {status: 'ok'};
    });
    fullHealth = wrapper(async () => {
        return {status: 'ok'};
    });
    status = wrapper(async () => {
        return {status: 'ok'};
    });
    livez = wrapper(async () => {
        return {status: 'ok'};
    });
    readyz = wrapper(async () => {
        return {status: 'ok'};
    });

    constructor() {
    }
}

export default HealthController;