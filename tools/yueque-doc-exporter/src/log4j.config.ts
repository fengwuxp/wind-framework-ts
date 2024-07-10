// log4js.config.js
export default {
    appenders: {
        output: {
            type: "console",
            backups: 3,
            compress: false,
            layout: {
                type: "pattern",
                pattern: "[%d{yyyy-MM-dd hh:mm:ss}] [%p] %f{1} line-%l: %m",
            },
        },
    },
    categories: {
        default: {
            appenders: ["output"],
            level: "info",
            enableCallStack: true
        },
    },
};

