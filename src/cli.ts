import {buildCli} from './composition/build-application';

const cli = buildCli();

cli.start().catch(err => {
    console.error('Failed to start CLI:', err);
    process.exit(1);
});
