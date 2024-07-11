import {program} from 'commander';
import {DocumentDownloader} from "./browser/DocumentDownloader";
import * as log4js from "log4js";
import log4jConfig from "./log4j.config";

log4js.configure(log4jConfig);

const logger = log4js.getLogger('YuqueBook');
const pkg = require('../package.json');

program.version(pkg.version)
    .option('-c, --cookie <n>', 'your yuque cookie 你的语雀 cookie')
    .option('-t, --csrfToken <n>', 'your yuque X-Csrf-Token 你的语雀 X-Csrf-Token')
    .option('-o, --output [item]', '文档保存目录')
    .parse(process.argv);


const appName = program.args[0];

const argvOpts = program.opts();
// @ts-ignore
const cookie = argvOpts.cookie;
// @ts-ignore
const csrfToken = argvOpts.csrfToken;
// @ts-ignore
const output = argvOpts.output

if (!appName || !cookie || !csrfToken) {
    console.warn('[waring] program need token & book url, but get app %s, cookie %s csrfToken %s', appName, cookie, csrfToken);
    process.exit(0);
}

new DocumentDownloader({
    cookie,
    csrfToken,
    appName,
    output: output
}).download().catch(error => {
    logger.error("导出文档失败", error)
    return Promise.resolve()
})



