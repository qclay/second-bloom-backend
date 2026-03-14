/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'no-circular',
            severity: 'warn',
            comment: 'This dependency is part of a circular relationship. Consider refactoring to break the cycle.',
            from: {},
            to: { circular: true },
        },
        {
            name: 'no-feature-to-infrastructure',
            severity: 'warn',
            comment: 'Feature modules should not depend on the internals of other feature modules directly. Use shared common services if needed.',
            from: { path: '^src/modules/([^/]+)/.+' },
            to: {
                path: '^src/modules/([^/]+)/.+',
                pathNot: '^src/modules/$1/.+',
            },
        },
        {
            name: 'common-no-feature',
            severity: 'error',
            comment: 'The common folder should not depend on feature modules.',
            from: { path: '^src/common/' },
            to: { path: '^src/modules/' },
        },
        {
            name: 'infrastructure-no-feature',
            severity: 'error',
            comment: 'The infrastructure folder should not depend on feature modules.',
            from: { path: '^src/infrastructure/' },
            to: { path: '^src/modules/' },
        },
    ],
    options: {
        doNotFollow: {
            path: 'node_modules',
        },
        tsPreCompilationDeps: true,
        tsConfig: {
            fileName: 'tsconfig.json',
        },
        enhancedResolveOptions: {
            exportsFields: ['exports'],
            conditionNames: ['import', 'require', 'node', 'default'],
        },
        reporterOptions: {
            dot: {
                collapsePattern: 'node_modules/(@[^/]+/[^/]+|[^/]+)',
            },
            archi: {
                collapsePattern: '^(packages|src|lib|app|bin|test(s?)|spec(s?))/[^/]+|node_modules/(@[^/]+/[^/]+|[^/]+)',
            },
        },
    },
};
