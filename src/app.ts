import buildApplication from "./composition/build-application";


const application = buildApplication();


application.start().catch(err => {
    logger.error({err}, 'Failed to start');
    process.exit(1);
});