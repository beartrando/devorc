import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import IssueCreateUseCase from "./application/use-cases/devorc/issue/issue-create";
import IssueFlushUseCase from "./application/use-cases/devorc/issue/issue-flush";
import IssueSelectUseCase from "./application/use-cases/devorc/issue/issue-select";
import ParkUseCase from "./application/use-cases/devorc/park";
import PullUseCase from "./application/use-cases/devorc/pull";
import PushUseCase from "./application/use-cases/devorc/push";
import StatusUseCase from "./application/use-cases/devorc/status";
import DevorcController from "./infrastructure/http/controllers/devorc.controller";
import HealthUseCase from "./application/use-cases/health/health";
import StatusUseCase from "./application/use-cases/health/status";
import LivezUseCase from "./application/use-cases/health/livez";
import ReadyzUseCase from "./application/use-cases/health/readyz";
import DbService from "./infrastructure/db/service";



const dbService = new DbService();

const healthUseCase = new HealthUseCase(dbService);
// const statusUseCase = new StatusUseCase;
// const livezUseCase = new LivezUseCase;
// const readyzUseCase = new ReadyzUseCase;

const issueCreateUseCase = new IssueCreateUseCase();
const issueFlushUseCase = new IssueFlushUseCase();
const issueSelectUseCase = new IssueSelectUseCase();
const pullUseCase = new PullUseCase();
const pushUseCase = new PushUseCase();
const parkUseCase = new ParkUseCase();
const issueStatusUseCase = new IssueStatusUseCase();



export class Cli {
    private readonly rl = createInterface({ input, output });

    async start(): Promise<void> {
        try {
            while (true) {
                console.log('\n=== DevOrc ===');
                console.log('1. Health');
                console.log('2. Create issue');
                console.log('3. Flush issue');
                console.log('4. Select issue');
                console.log('5. Pull');
                console.log('6. Push');
                console.log('7. Park');
                console.log('8. Status');
                console.log('0. Exit');

                const choice = await this.rl.question('Choose action: ');

                try {
                    switch (choice.trim()) {
                        case '1':
                            await this.health();
                            break;
                        case '2':
                            await this.issueCreate();
                            break;
                        case '3':
                            await this.issueFlush();
                            break;
                        case '4':
                            await this.issueSelect();
                            break;
                        case '5':
                            await this.pull();
                            break;
                        case '6':
                            await this.push();
                            break;
                        case '7':
                            await this.park();
                            break;
                        case '8':
                            await this.status();
                            break;
                        case '0':
                            return;
                        default:
                            console.log('Unknown action');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        } finally {
            this.rl.close();
        }
    }


    private async health(): Promise<void> {
        return await healthUseCase.execute();
    }

    private async createIssue(): Promise<void> {
        //asc for issue name
        return await createIssueUseCase.execute();
    }

    private async flushIssue(): Promise<void> {
        return await flushIssueUseCase.execute();
    }

    private async selectIssue(): Promise<void> {
        return await selectIssueUseCase.execute();
    }

    private async pull(): Promise<void> {
        return await pullUseCase.execute();
    }

    private async push(): Promise<void> {
        return await pushUseCase.execute();
    }

    private async park(): Promise<void> {
        return await parkUseCase.execute();
    }

    private async status(): Promise<void> {
        return await statusUseCase.execute();
    }
}

export default Cli;
