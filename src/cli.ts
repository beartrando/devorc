import {createInterface} from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';

import IssueCreateUseCase from './application/use-cases/devorc/issue/issue-create';
import IssueFlushUseCase from './application/use-cases/devorc/issue/issue-flush';
import IssueSelectUseCase from './application/use-cases/devorc/issue/issue-select';
import ParkUseCase from './application/use-cases/devorc/park';
import PullUseCase from './application/use-cases/devorc/pull';
import PushUseCase from './application/use-cases/devorc/push';
import IssueStatusUseCase from './application/use-cases/devorc/status';
import HealthUseCase from './application/use-cases/health/health';
import DbService from './infrastructure/db/service';
import GithubService from './infrastructure/github/service';
import GitService from './infrastructure/git/service';
import gitConfig from './infrastructure/git/config';




const dbService = new DbService();
const healthUseCase = new HealthUseCase(dbService);

const githubService = new GithubService();
const gitService = new GitService(gitConfig);

const issueCreateUseCase = new IssueCreateUseCase(githubService, gitService);
const issueFlushUseCase = new IssueFlushUseCase(githubService, gitService);
const issueSelectUseCase = new IssueSelectUseCase(githubService, gitService);
const parkUseCase = new ParkUseCase(githubService, gitService);
const pullUseCase = new PullUseCase(githubService, gitService);
const pushUseCase = new PushUseCase(githubService, gitService);
const issueStatusUseCase = new IssueStatusUseCase(githubService, gitService);

export class Cli {
    private readonly rl = createInterface({input, output});

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
                            await this.createIssue();
                            break;
                        case '3':
                            await this.flushIssue();
                            break;
                        case '4':
                            await this.selectIssue();
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
        await healthUseCase.execute();
    }

    private async createIssue(): Promise<void> {
        await issueCreateUseCase.execute();
    }

    private async flushIssue(): Promise<void> {
        await issueFlushUseCase.execute();
    }

    private async selectIssue(): Promise<void> {
        await issueSelectUseCase.execute();
    }

    private async pull(): Promise<void> {
        await pullUseCase.execute();
    }

    private async push(): Promise<void> {
        await pushUseCase.execute();
    }

    private async park(): Promise<void> {
        await parkUseCase.execute();
    }

    private async status(): Promise<void> {
        await issueStatusUseCase.execute();
    }

}

export default Cli;
