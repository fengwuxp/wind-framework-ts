import * as os from 'os';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import filesize from "rollup-plugin-filesize";
import includePaths from "rollup-plugin-includepaths";
import analyze from "rollup-plugin-analyzer";

import pkg from './package.json' assert {type: 'json'};
import {DEFAULT_EXTENSIONS} from "@babel/core";

const cpuNums = os.cpus().length;

const getConfig = (isProd) => {
    // @ts-ignore
    // @ts-ignore
    return {
        input: './src/index.ts',

        // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
        // https://rollupjs.org/guide/en#external-e-external
        external: [
            "core-js",
            "log4js",
            "@babel/runtime-corejs3",
            "@abraham/reflection",
            "async-validator",
            "xregexp",
            "xregexp-quotemeta",
            "querystring",
            "lodash/memoize",
            "wind-proxy",
            "wind-api-signature",
            "wind-common-utils",
            "wind-common-utils/lib/date/DateFormatUtils",
            "wind-common-utils/lib/match/SimplePathMatcher",
            "wind-common-utils/lib/http/HttpMediaType",
            "wind-common-utils/lib/string/StringUtils"
        ],
        output: [
            {
                file: isProd ? pkg.esnext.replace(".js", ".min.js") : pkg.esnext,
                format: 'esm',
                compact: true,
                extend: false,
                sourcemap: isProd,
                strictDeprecations: false,
                interop: "auto"
            }
        ],
        plugins: [
            typescript({
                tsconfig: "./tsconfig.lib.json",
                tsconfigOverride: {
                    compilerOptions: {
                        target: "esnext",
                        declaration: false
                    }
                }
            }),
            json(),
            resolve(),
            commonjs({
                // 包括
                include: [],
                // 排除
                exclude: [],
                extensions: [...DEFAULT_EXTENSIONS, ".ts", ".tsx"],
            }),
            analyze({
                stdout: true,
            }),
            filesize(),
            includePaths({
                paths: ["./src"]
            }),
            //压缩代码
            isProd && terser({
                keep_classnames: false,
                ie8: false,
                ecma: 2015,
                numWorkers: cpuNums
            }),

        ],
        treeshake: {
            moduleSideEffects: true
        },
    }
};


export default [
    getConfig(false),
    getConfig(true),
]

