import axios from 'axios';
import {DocDetails, RepoCategory, RepoDetails, RepoDocTreeMenu, RepoListItem, RepoReqeustParam} from "../model";


export default class ApiRequester {
    readonly url: string;
    readonly token: string;
    readonly headers: any;
    readonly parser: (d: any) => any;
    readonly client: any;

    constructor(token: string, appName: String) {
        this.url = appName ? `https://${appName}.yuque.com/api/v2` : 'https://www.yuque.com/api/v2'
        this.token = token;
        this.headers = {
            'User-Agent': appName ? appName : "app-name",
            'X-Auth-Token': token,
            // 'Content-Type': 'application/x-www-form-urlencoded'
        };
        this.client = {};

        ['get', 'post', 'delete', 'put'].forEach((method) => {
            this.client[method] = (url: string, options: any) => {
                const s = `${this.url}${url}`;
                return axios[method](s, {headers: this.headers, ...options}).then((d: any) => d.data);
            };
        });
    }


    /**
     * 获取用户/团队的知识库列表
     * @param {string} repoId 标识（团队和个人的登录名或者ID）
     * @param param
     */
    getRepos = (repoId: string, param: RepoReqeustParam = {
        category: RepoCategory.TEAM,
        type: 'all',
        offset: 20
    }): Promise<Array<RepoListItem>> => {
        const path: string = param.category === RepoCategory.TEAM ? `/groups/${repoId}/repos` : `/users/${repoId}/repos`;
        return this.client.get(path).then(resp => resp.data);
    }

    /**
     * 获取参考详情
     * @param namespace namespace 或者是 id
     */
    getRepoDetails = (namespace: string): Promise<RepoDetails> => {
        return this.client.get(`/repos/${namespace}`).then(resp => resp.data);
    }

    /**
     * 获取仓库下的文档
     * @param namespace namespace 或者是 id
     */
    getRepoDocTree = (namespace: string): Promise<Array<RepoDocTreeMenu>> => {
        return this.client.get(`/repos/${namespace}/toc`).then(resp => resp.data);
    }

    /**
     * 获取文档详情
     * @param namespace namespace 或者是 id
     * @param slug slug 或者是 id
     */
    getRepoDocDetails = (namespace: string, slug: string): Promise<DocDetails> => {
        return this.client.get(`/repos/${namespace}/docs/${slug}`).then(resp => resp.data);
    }


    async hello() {
        return this.client.get('/hello');
    }

    async user(key: string) {
        return this.client.get(`/users/${key}`);
    }

    async self() {
        return this.client.get('/user');
    }

    async userDocs(query?: string, offset?: number) {
        return this.client.get('/user/docs', {params: {query, offset}});
    }

    async recentUpdated(type?: string, offset?: number) {
        return this.client.get('/user/recent-updated', {params: {type, offset}});
    }
}

