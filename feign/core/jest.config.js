module.exports = {
    transform: {
        '^.+\\.ts[x]?$': 'ts-jest',
    },
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    testPathIgnorePatterns: ["/lib/"],
    transformIgnorePatterns: [],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverage: false,
    globals: {
        'ts-jest': {
            tsConfig: './tsconfig.test.json',
        },
    },
};
