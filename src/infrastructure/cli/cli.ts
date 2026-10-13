import {createInterface} from 'node:readline/promises';
import {emitKeypressEvents} from 'node:readline';
import {stdin as input, stdout as output} from 'node:process';

import IssueFlushUseCase from '../../application/use-cases/devorc/issue/issue-flush';
import IssueSelectUseCase from '../../application/use-cases/devorc/issue/issue-select';
import ParkUseCase from '../../application/use-cases/devorc/park';
import PullUseCase from '../../application/use-cases/devorc/pull';
import PushUseCase from '../../application/use-cases/devorc/push';
import RefreshStatusUseCase from '../../application/use-cases/devorc/refresh-status';
import IssueCreateUseCase from '../../application/use-cases/devorc/issue/issue-create';
import GitService from '../git/service';

export class Cli {
    private readonly rl = createInterface({input, output});
    private selectedMenuIndex = 0;

    constructor(
        private readonly gitService: GitService,
        private readonly issueCreateUseCase: IssueCreateUseCase,
        private readonly issueFlushUseCase: IssueFlushUseCase,
        private readonly issueSelectUseCase: IssueSelectUseCase,
        private readonly parkUseCase: ParkUseCase,
        private readonly pullUseCase: PullUseCase,
        private readonly pushUseCase: PushUseCase,
        private readonly statusUseCase: RefreshStatusUseCase,
    ) {}

    async start(): Promise<void> {
        emitKeypressEvents(input);

        if (!input.isTTY) {
            throw new Error('Interactive CLI requires a TTY');
        }

        try {
            while (true) {
                console.clear();
                const choice = await this.selectMenu();

                try {
                    switch (choice) {
                        case 'Status':
                            await this.status();
                            break;
                        case 'Create issue':
                            await this.createIssue();
                            break;
                        case 'Flush issue':
                            await this.flushIssue();
                            break;
                        case 'Select issue':
                            await this.selectIssue();
                            break;
                        case 'Pull':
                            await this.pull();
                            break;
                        case 'Commit and push all':
                            await this.push();
                            break;
                        case 'Park':
                            await this.park();
                            break;
                        case 'Exit':
                            return;
                    }
                } catch (error) {
                    console.error('Error:', error);
                    await this.rl.question('\nPress Enter to continue...');
                }
            }
        } finally {
            this.rl.close();
        }
    }

    private async selectMenu(): Promise<string> {
        const items = [
            'Status',
            'Create issue',
            'Flush issue',
            'Select issue',
            'Pull',
            'Commit and push all',
            'Park',
            'Exit',
        ];

        const render = () => {
            console.clear();
            this.showRepositoryStatuses();
            console.log('\n=== DevOrc ===\n');

            items.forEach((item, index) => {
                console.log(
                    `${index + 1}. ${index === this.selectedMenuIndex ? '❯' : ' '} ${item}`,
                );
            });

            console.log('\n↑ ↓ Navigate · 1–8 Select · Enter Confirm · Ctrl+C Exit');
        };

        input.setRawMode(true);
        render();

        try {
            return await new Promise<string>((resolve) => {
                const cleanup = () => {
                    input.removeListener('keypress', onKeypress);
                };

                const onKeypress = (
                    _str: string,
                    key: {name?: string; ctrl?: boolean},
                ) => {
                    if (key.ctrl && key.name === 'c') {
                        cleanup();
                        resolve('Exit');
                        return;
                    }

                    const number = Number(key.name);

                    if (
                        Number.isInteger(number) &&
                        number >= 1 &&
                        number <= items.length
                    ) {
                        this.selectedMenuIndex = number - 1;
                        cleanup();
                        resolve(items[this.selectedMenuIndex]);
                        return;
                    }

                    if (key.name === 'up') {
                        this.selectedMenuIndex =
                            (this.selectedMenuIndex - 1 + items.length) % items.length;
                        render();
                    } else if (key.name === 'down') {
                        this.selectedMenuIndex =
                            (this.selectedMenuIndex + 1) % items.length;
                        render();
                    } else if (key.name === 'return') {
                        cleanup();
                        resolve(items[this.selectedMenuIndex]);
                    }
                };

                input.on('keypress', onKeypress);
            });
        } finally {
            input.setRawMode(false);
        }
    }

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

    private showRepositoryStatuses(): void {
        const statuses = this.gitService.getRepositoryStatuses();

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
