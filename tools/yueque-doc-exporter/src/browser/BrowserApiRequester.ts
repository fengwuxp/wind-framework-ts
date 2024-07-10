import axios from 'axios';
import fetch from 'node-fetch';
import {DocListItem, GroupBookStacksDetails, GroupListItem} from "./ApiModel";
import * as fs from "fs-extra";
import * as log4js from "log4js";
import log4jConfig from "../log4j.config";

log4js.configure(log4jConfig);

const logger = log4js.getLogger('BrowserApiRequester');

export default class BrowserApiRequester {

    private readonly headers: Record<any, any>;

    private readonly url: string;

    constructor(headers: Record<any, any>, appName: string) {
        this.headers = headers;
        this.url = `https://${appName}.yuque.com/api`;
    }

    getGroupQuickLinks = (): Promise<Array<GroupListItem>> => {
        return this.httpGet(`/mine/group_quick_links`)
    }

    /**
     * 获取团队详情
     * @param login 登录 id
     */
    getGroupDetails = (login: string) => {
        return this.httpGet(`/groups/${login}/detail`)
    }

    /**
     * 团队 book
     * @param groupId
     */
    getGroupBookStacks = (groupId: number): Promise<GroupBookStacksDetails[]> => {
        return this.httpGet(`/groups/${groupId}/bookstacks`)
    }

    /**
     * 获取知识库的文档列表
     */
    getBookDocs = (bookId: number): Promise<DocListItem[]> => {
        return this.httpGet(`/docs?book_id=${bookId}`)
    }

    /**
     * 导出文件
     * @param doc 文档
     * @param output 输出目录
     * @return 文件保存路径地址
     */
    exportDocs = (doc: DocListItem, output: string): Promise<string> => {
        const requestBody: any = {
            "force": 0
        };
        if (doc.type === 'Sheet') {
            requestBody.type = "excel";
        } else if (doc.type === 'Doc') {
            requestBody.options = "{\"latexType\":1}"
            requestBody.type = "markdown";
        } else {
            throw new Error(`不支持的文档类型：${doc.type}`)
        }
        const url = `${this.url}/docs/${doc.id}/export`;
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: {
                ...this.headers,
                'Content-Type': 'application/json'
            }
        }).then(resp => resp.json() as any)
            .then(resp => {
                if (resp.status != null) {
                    return Promise.reject(`文档：${doc.title}，${resp.message}`);
                }
                return resp.data
            })
            .then(resp => {
                if (resp.state === "success") {
                    return resp.url;
                } else {
                    // 轮询
                    return this.pollExportState(url, 0);
                }
            }).then(url => {
                let downloadUrl: string = url;
                if (downloadUrl.startsWith(this.url)) {
                    downloadUrl =
                        `${this.url}/${downloadUrl}`
                    ;
                }
                return this.downloadFile(downloadUrl, output)
            });
    }

    private pollExportState = (exportUrl: string, count: number) => {
        if (count > 6) {
            return Promise.reject(`轮询次数超过 6 次`);
        }
        return axios.get(exportUrl, {headers: this.headers})
            .then((d: any) => d.data)
            .then(resp => {
                if (resp.state === "success") {
                    return resp.url;
                } else {
                    return new Promise(resolve => {
                        // 等待 1.5s
                        setTimeout(resolve, 1500)
                    }).then(() => this.pollExportState(exportUrl, count++));
                }
            });
    }

    /**
     * 下载语雀导出文件
     * @param url 导出地址
     * @param output 下载文件保存地址
     */
    downloadFile = (url: string, output: string): Promise<string> => {
        return axios.get(url, {headers: this.headers, responseType: 'stream'}).then(response => {
            // @ts-ignore
            const totalLength = response.headers['content-length'];
            const disposition: string = response.headers['content-disposition']
            // 获取 utf-8 name
            const [_, fileNameParam] = disposition.split(";")[2].split("=");
            // UTF-8''xxxx.md
            const fileName = decodeURI(fileNameParam.substring(7, fileNameParam.length));

            const filepath =
                `${output}/${fileName}`
            ;
            fs.createFileSync(filepath);
            const writer = fs.createWriteStream(filepath);
            let progress = 0;
            response.data.on('data', (chunk) => {
                progress += chunk.length;
                logger.info(
                    `Downloaded ${(progress / totalLength * 100).toFixed(2)}%`
                );
            });

            response.data.pipe(writer);
            return new Promise<string>((resolve, reject) => {
                writer.on('finish', () => {
                    resolve(filepath)
                });

                writer.on('error', (error) => {
                    reject(error);
                });
            })
        })
    }

    private httpGet = (path: string) => {
        return axios.get(
            `${this.url}${path}`
            , {headers: this.headers}).then((d: any) => d.data.data);
    }
}