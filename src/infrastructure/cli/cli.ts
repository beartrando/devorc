import {createInterface} from 'node:readline/promises';
import {emitKeypressEvents} from 'node:readline';
import {stdin as input, stdout as output} from 'node:process';

import IssueFlushUseCase from '../../application/use-cases/devorc/issue/issue-flush';
import IssueSelectUseCase from '../../application/use-cases/devorc/issue/issue-select';
import CheckoutUseCase from '../../application/use-cases/devorc/checkout';
import PullUseCase from '../../application/use-cases/devorc/pull';
import IssueCreateUseCase from '../../application/use-cases/devorc/issue/issue-create';
import GitService from '../git/service';
import Table from 'cli-table3';
import CalculateStatusUseCase from "../../application/use-cases/devorc/calculate-status";
import RefreshStatusUseCase from "../../application/use-cases/devorc/refresh-status";
import IssueToReviewUseCase from "../../application/use-cases/devorc/issue/issue-to-review";

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
            label: 'Select issue',
            action: () => this.selectIssue(),
        },
        {
            label: 'Flush issue',
            action: () => this.flushIssue(),
        },
        {
            label: 'Pull',
            action: () => this.pull(),
        },
        {
            label: 'Commit, push and create pull-requests',
            action: () => this.issueToReview(),
        },
        {
            label: 'Checkout',
            action: () => this.checkout(),
        },
        {
            label: 'Extra repositories: OFF/ON',
            action: () => this.gitService.toggleExtraRepositoriesEnabled(),
        },
        {
            label: 'Module repositories: OFF/ON',
            action: () => this.gitService.toggleModulesRepositoriesEnabled(),
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
        private readonly checkoutUseCase: CheckoutUseCase,
        private readonly pullUseCase: PullUseCase,
        private readonly issueToReviewUseCase: IssueToReviewUseCase,
        private readonly calculateStatusUseCase: CalculateStatusUseCase,
        private readonly refreshStatusUseCase: RefreshStatusUseCase,
    ) {
    }

    async start(): Promise<void> {
        if (!input.isTTY) {
            throw new Error('Interactive CLI requires a TTY');
        }

        emitKeypressEvents(input);

        await this.gitService.calculateRepositoryStatuses();

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
                    await this.keypress();
                }
            }
        } finally {
            this.rl.close();

            if (input.isTTY) {
                input.setRawMode(false);
            }
        }
    }

    private async selectMenu(): Promise<string> {
        const items = this.menu.map(({label}) => label);

        const render = async () => {
            // console.clear();
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

        try {
            input.setRawMode(true);
            await render();

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
                        ['q', 'Q', 'й', 'Й'].includes(key.name ?? '')
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
                        void render();
                    } else if (key.name === 'down') {
                        this.selectedMenuIndex =
                            (this.selectedMenuIndex + 1) % items.length;
                        void render();
                    } else if (key.name === 'return') {
                        cleanup();
                        resolve(items[this.selectedMenuIndex]);
                    }
                };

                input.on('keypress', onKeypress);
            });
        } finally {
            if (input.isTTY) {
                input.setRawMode(false);
            }
        }
    }

    private async keypress(): Promise<void> {
        console.log('\nPress any key to continue...');

        try {
            input.setRawMode(true);

            await new Promise<void>((resolve) => {
                input.once('keypress', () => resolve());
            });
        } finally {
            if (input.isTTY) {
                input.setRawMode(false);
            }
        }
    }

    private async refreshRepositoryStatuses(): Promise<void> {
        console.log('wait...');
        await this.refreshStatusUseCase.execute();
        await this.keypress();
    }

    private async createIssue(): Promise<void> {
        const name = await this.rl.question('Enter branch name: ');
        console.log('wait...');
        await this.issueCreateUseCase.execute(name);
        await this.keypress();
    }

    private async flushIssue(): Promise<void> {
        await this.issueFlushUseCase.execute();
        await this.keypress();
    }

    private async selectIssue(): Promise<void> {
        const id = await this.rl.question('Enter issue id: ');
        console.log('select issue');
        console.log('wait...');
        await this.issueSelectUseCase.execute(id);
        await this.keypress();
    }

    private async pull(): Promise<void> {
        console.log('wait...');
        await this.pullUseCase.execute();
        await this.keypress();
    }

    private async issueToReview(): Promise<void> {
        console.log('wait...');
        const pullRequests = await this.issueToReviewUseCase.execute();
        for (const item of pullRequests) {
            console.log(item);
        }
        await this.keypress();
    }

    private async checkout(): Promise<void> {
        console.log('wait...');
        await this.checkoutUseCase.execute();
        await this.keypress();
    }

    private async status(): Promise<void> {
        await this.calculateStatusUseCase.execute();
    }

    private async showRepositoryStatuses(): Promise<void> {
        const statuses = this.gitService.getRepositoryStatuses();

        const table = new Table({
            head: ['Affected', 'Repository', 'Branch', 'WorkingTree', 'Origin'],
            chars: {
                mid: '',
                'left-mid': '',
                'mid-mid': '',
                'right-mid': '',
            },
        });

        for (const [repository, status] of statuses) {
            const row = [
                status.affected,
                repository,
                status.branch.value || '(detached HEAD)',
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
        console.log(
            'Extra: ' + (this.gitService.getExtraRepositoriesEnabled() ? 'On' : 'Off') + '. '
            + 'Modules: ' + (this.gitService.getModulesRepositoriesEnabled() ? 'On' : 'Off')
        );
    }
}

export default Cli;
