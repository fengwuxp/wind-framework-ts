import axios from 'axios';
import fetch from 'node-fetch';
import {DocListItem, GroupBookStacksDetails, GroupListItem, PublicBookGroup} from "./ApiModel";
import * as fs from "fs-extra";
import * as log4js from "log4js";
import log4jConfig from "../log4j.config";

log4js.configure(log4jConfig);

const logger = log4js.getLogger('BrowserApiRequester');

/**
 * 企业版语雀文档浏览器版本接口
 */
export default class EnterpriseBrowserApiRequester {

    private readonly headers: Record<any, any>;

    private readonly apiUrl: string;

    private readonly url: string;

    constructor(headers: Record<any, any>, appName: string) {
        this.headers = headers;
        this.url = `https://${appName}.yuque.com`;
        this.apiUrl = `${this.url}/api`;
    }

    getMineCommonUsed = () => {
        return this.httpGet(`/mine/common_used`)
    }

    /**
     * 获取公共区知识库分组
     */
    getPublicBookGroups = (): Promise<Array<PublicBookGroup>> => {
        return this.getMineCommonUsed().then(({groups}) => {
            const organizationId = groups[0].organization_id
            return axios.get(this.getApiRequestUrl(`/modules/org_wiki/wiki/show?organizationId=${organizationId}`), {headers: this.headers}).then(resp => resp.data)
        }).then(resp => {
            return resp.layouts[0].placements[0].blocks.filter(block => {
                return block.title === '知识库分组'
            })[0].data;
        });
    }

    /**
     * 获取团队列表(有权限的)
     */
    getGroups = (): Promise<Array<GroupListItem>> => {
        return this.getMineCommonUsed().then(({groups}) => {
            const organizationId = groups[0].organization_id
            return this.httpGet(`/mine/groups?offset=0&limit=200&organization_id=${organizationId}`);
        });
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
        return this.retryExportDocs(doc, output, 0);
    }

    private retryExportDocs = (doc: DocListItem, output: string, count: number) => {
        if (count > 5) {
            return Promise.reject(`重试次数超过 5 次`);
        }
        const requestBody: any = {
            "force": 0
        };
        if (doc.type === 'Sheet' || doc.type === 'Table') {
            requestBody.type = "excel";
        } else if (doc.type === 'Doc') {
            requestBody.options = "{\"latexType\":1}"
            requestBody.type = "markdown";
        } else {
            throw new Error(`不支持的文档类型：${doc.type}`)
        }
        const exportRequestUrl = this.getApiRequestUrl(`/docs/${doc.id}/export`);
        return fetch(exportRequestUrl, {
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
                    // 重试
                    return new Promise(resolve => {
                        // 等待 1.5s
                        setTimeout(resolve, 1500)
                    }).then(() => this.retryExportDocs(doc, output, count++));
                }
            }).then((url: string) => {
                if (!url.startsWith(this.url)) {
                    url = `${this.url}${url}`;
                }
                return this.downloadFile(url, output)
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
            const fileName = this.parseFileName(response.headers['content-disposition']);

            const filepath = `${output}/${fileName}`;
            fs.createFileSync(filepath);
            const writer = fs.createWriteStream(filepath);
            let progress = 0;
            response.data.on('data', (chunk) => {
                progress += chunk.length;
                logger.debug(`Downloaded ${(progress / totalLength * 100).toFixed(2)}%`);
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

    private httpGet = (uri: string) => {
        return axios.get(this.getApiRequestUrl(uri), {headers: this.headers}).then((resp: any) => resp.data.data);
    }

    private getApiRequestUrl = (uri: string) => {
        return `${this.apiUrl}${uri}`
    }

    private parseFileName(disposition: string) {
        const parts = disposition.split(";");
        // 获取  name
        const [_, fileNameParam] = parts.pop().split("=");
        // UTF-8''xxxx.md
        return fileNameParam.includes("UTF-8") ? decodeURI(fileNameParam.substring(7, fileNameParam.length)) : fileNameParam.substring(1, fileNameParam.length);
    }
}