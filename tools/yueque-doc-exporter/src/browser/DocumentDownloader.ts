import BrowserApiRequester from "./BrowserApiRequester";
import {GroupBook, GroupListItem} from "./ApiModel";
import * as path from "path";
import * as process from "process";
import * as log4js from "log4js";
import log4jConfig from "../log4j.config";

log4js.configure(log4jConfig);

const logger = log4js.getLogger('DocumentDownloader');

export interface DocumentDownloaderOptions {
    cookie: string;
    csrfToken: string;
    appName: string;
    output?: string;
}

export class DocumentDownloader {

    private readonly requester: BrowserApiRequester;

    private readonly output: string;

    private successCount = 0;

    private errorCount = 0;

    constructor(options: DocumentDownloaderOptions) {
        this.requester = new BrowserApiRequester({
            "Cookie": options.cookie,
            "X-Csrf-Token": options.csrfToken
        }, options.appName);
        this.output = options.output ?? path.join(process.cwd(), "docs");
    }

    download = async () => {
        const groups = await this.requester.getGroupQuickLinks();
        for (const group of groups) {
            await this.eachGroup(group)
        }
        logger.info(`导出完成，成功数：${this.successCount}，失败数据：${this.errorCount}`);
    }

    private eachGroup = async (group: GroupListItem) => {
        const groupBookStacks = await this.requester.getGroupBookStacks(group.target_id);
        for (const stack of groupBookStacks) {
            for (const bk of stack.books) {
                await this.eachGroupBook(group.target.name, bk)
            }
        }
    }

    private eachGroupBook = async (groupName: string, book: GroupBook) => {
        const docs = await this.requester.getBookDocs(book.id);
        for (const doc of docs) {
            if (doc.slug === "#") {
                continue;
            }
            try {
                await this.requester.exportDocs(doc, path.join(this.output, groupName, book.name));
                this.successCount++;
            } catch (e) {
                logger.error(`export doc group =  ${groupName}, book = ${book.name} error`, e);
                this.errorCount++;
            }
            logger.info(`导出 group =  ${groupName}, book = ${book.name} 成功`)
        }
    }
}