export const gitConfig = {
    projectDir: process.env.PROJECT_DIR ?? '/usr/src/app',
    gitServiceRepos: (process.env.GIT_SERVICE_REPOS ?? '').split(':').filter(Boolean),
    gitExtraRepos: (process.env.GIT_EXTRA_REPOS ?? '').split(':').filter(Boolean),
    gitModuleRepos: (process.env.GIT_MODULE_REPOS ?? '').split(':').filter(Boolean),

    extraReposEnabledByDefault: process.env.GIT_EXTRA_REPOS_ENABLED_BY_DEFAULT === 'true',
    moduleReposEnabledByDefault: process.env.GIT_MODULE_REPOS_ENABLED_BY_DEFAULT === 'true',
};

export default gitConfig;
