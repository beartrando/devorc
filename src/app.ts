import buildApplication from "./composition/build-application";
import logger from "@shared/logger";


const application = buildApplication();


application.start().catch(err => {
    logger.error({err}, 'Failed to start');
    process.exit(1);
});
