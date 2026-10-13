import {createInterface} from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';

import IssueFlushUseCase from '../../application/use-cases/devorc/issue/issue-flush';
import IssueSelectUseCase from '../../application/use-cases/devorc/issue/issue-select';
import ParkUseCase from '../../application/use-cases/devorc/park';
import PullUseCase from '../../application/use-cases/devorc/pull';
import PushUseCase from '../../application/use-cases/devorc/push';
import RefreshStatusUseCase from '../../application/use-cases/devorc/refresh-status';
import IssueCreateUseCase from "../../application/use-cases/devorc/issue/issue-create";
import GitService from "../git/service";

export class Cli {
    private readonly rl = createInterface({input, output});

    constructor(
        private readonly gitService: GitService,
        private readonly issueCreateUseCase: IssueCreateUseCase,
        private readonly issueFlushUseCase: IssueFlushUseCase,
        private readonly issueSelectUseCase: IssueSelectUseCase,
        private readonly parkUseCase: ParkUseCase,
        private readonly pullUseCase: PullUseCase,
        private readonly pushUseCase: PushUseCase,
        private readonly statusUseCase: RefreshStatusUseCase,
    ) {
    }

    async start(): Promise<void> {
        try {
            while (true) {
                await this.showRepositoryStatuses();

                console.log('\n=== DevOrc ===');
                console.log('1. Status');
                console.log('2. Create issue');
                console.log('3. Flush issue');
                console.log('4. Select issue');
                console.log('5. Pull');
                console.log('6. Push');
                console.log('7. Park');
                // console.log('8. Health');
                console.log('0. Exit');

                const choice = await this.rl.question('Choose action: ');

                try {
                    switch (choice.trim()) {
                        case '1':
                            await this.status();
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
                        // case '8':
                        //     await this.health();
                        //     break;
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

    // private async health(): Promise<void> {
    //     await this.healthUseCase.execute();
    // }

    private async createIssue(): Promise<void> {
        const name = await this.rl.question('Enter branch name: ');
        await this.issueCreateUseCase.execute(name);
    }

    private async flushIssue(): Promise<void> {
        await this.issueFlushUseCase.execute();
    }

    private async selectIssue(): Promise<void> {
        await this.issueSelectUseCase.execute();
    }

    private async pull(): Promise<void> {
        await this.pullUseCase.execute();
    }

    private async push(): Promise<void> {
        await this.pushUseCase.execute();
    }

    private async park(): Promise<void> {
        await this.parkUseCase.execute();
    }

    private async status(): Promise<void> {
        await this.statusUseCase.execute();
    }

    private async showRepositoryStatuses(): Promise<void> {
        const statuses = await this.gitService.getRepositoryStatuses();

        console.table(
            Array.from(statuses, ([repository, status]) => ({
                Repository: repository,
                Branch: status.branch || '(detached HEAD)',
                WorkingTree: status.workingTree,
                Origin: status.origin,
            })),
        );
    }
}

export default Cli;
