module.exports = {
    testEnvironment: "node",
    transform: {
        '^.+\\.ts[x]?$': 'ts-jest',
        "^.+\\.jsx?$": "babel-jest"
    },
    testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
    testPathIgnorePatterns: ["/lib/", "/es/", "/exnext/"],
    transformIgnorePatterns: [],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverage: false,
    globals: {
        'ts-jest': {
            tsConfig: './tsconfig.test.json',
        },
    },
};
