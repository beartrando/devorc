import buildApplication from "./composition/build-application";
import Application from "./application/application";


const httpService = buildApplication();

const application = new Application(50051);

application.start().catch(err => {
    logger.error({err}, 'Failed to start');
    process.exit(1);
});