export const DEFAULT_BRANCH_NAME = 'dev';

const ALLOWED_EXCEPTIONS = [DEFAULT_BRANCH_NAME, 'uat'];

export class BranchName {
    private constructor(
        public readonly value: string,
    ) {
    }

    static create(name: string): BranchName {
        if (
            !ALLOWED_EXCEPTIONS.includes(name) &&
            !/^\d+-[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(name)
        ) {
            throw new Error(`Invalid branch name: ${name}`);
        }

        return new BranchName(name);
    }

    toString(): string {
        return this.value;
    }

    equals(other: BranchName): boolean {
        return this.value === other.value;
    }

    isDefault(): boolean {
        return this.value == DEFAULT_BRANCH_NAME;
    }
}

export default BranchName;
