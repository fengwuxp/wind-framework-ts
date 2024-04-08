module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            {
                modules: false
            }
        ],
    ],
    "plugins": [
        [
            "@babel/plugin-transform-runtime",
            {
                corejs: false,
                helpers: true,
                regenerator: false,
                useESModules: false
            }
        ]
    ],
};
