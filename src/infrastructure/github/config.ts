function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is missing`);
    }
    return value;
}

export const gitConfig = {
    projectId: required("PROJECT_ID"),
};

export default gitConfig;
