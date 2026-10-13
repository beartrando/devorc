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
import Table from 'cli-table3';


type MenuItem = {
    label: string;
    action: () => Promise<void> | void;
};

export class Cli {
    private readonly rl = createInterface({input, output});
    private selectedMenuIndex = 0;

    private readonly menu: MenuItem[] = [
        {
            label: 'Refresh status',
            action: () => this.refreshRepositoryStatuses(),
        },
        {
            label: 'Create issue',
            action: () => this.createIssue(),
        },
        {
            label: 'Flush issue',
            action: () => this.flushIssue(),
        },
        {
            label: 'Select issue',
            action: () => this.selectIssue(),
        },
        {
            label: 'Pull',
            action: () => this.pull(),
        },
        {
            label: 'Commit and push all',
            action: () => this.push(),
        },
        {
            label: 'Park',
            action: () => this.park(),
        },
        {
            label: 'Exit',
            action: () => {
            },
        },
    ];

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
        emitKeypressEvents(input);
        await this.gitService.calculateRepositoryStatuses({extra: true, module: true});

        if (!input.isTTY) {
            throw new Error('Interactive CLI requires a TTY');
        }

        try {
            while (true) {
                await this.status();

                const choice = await this.selectMenu();
                const item = this.menu.find(({label}) => label === choice);

                if (item?.label === 'Exit') {
                    return;
                }

                try {
                    await item?.action();
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
        const items = this.menu.map(({label}) => label);

        const render = async () => {
            console.clear();
            await this.showRepositoryStatuses();
            console.log('\n=== DevOrc ===\n');

            items.forEach((item, index) => {
                console.log(
                    `${index + 1}. ${index === this.selectedMenuIndex ? '❯' : ' '} ${item}`,
                );
            });

            console.log(
                `\n↑ ↓ Navigate · 1–${items.length} Select · Enter Confirm · Q Exit`,
            );
        };

        input.setRawMode(true);
        await render();

        try {
            return await new Promise<string>((resolve) => {
                const cleanup = () => {
                    input.removeListener('keypress', onKeypress);
                };

                const onKeypress = (
                    _str: string,
                    key: { name?: string; ctrl?: boolean },
                ) => {
                    if (
                        (key.ctrl && key.name === 'c') ||
                        key.name === 'q' ||
                        key.name === 'Q' ||
                        key.name === 'й' ||
                        key.name === 'Й'
                    ) {
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

    private async refreshRepositoryStatuses(): Promise<void> {
        await this.gitService.refreshRepositoryStatuses();
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

    private async showRepositoryStatuses(): Promise<void> {
        const statuses = this.gitService.getRepositoryStatuses();
        const table = new Table({
            head: ['Repository', 'Branch', 'WorkingTree', 'Origin'],
            chars: {
                'mid': '',
                'left-mid': '',
                'mid-mid': '',
                'right-mid': '',
            },
        });

        for (const [repository, status] of statuses) {
            const row = [
                repository,
                status.branch || '(detached HEAD)',
                status.workingTree,
                status.origin,
            ];

            table.push(
                status.workingTree !== 'dirty'
                    ? row.map(value => `\x1b[36m${value}\x1b[0m`)
                    : row,
            );
        }

        console.log(table.toString());
    }
}

export default Cli;
