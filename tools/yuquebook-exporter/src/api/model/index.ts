/**
 * 仓库类型
 */
export enum RepoCategory {

    PERSONAL,

    TEAM
}

export interface RepoReqeustParam {
    /**
     *  知识库归属，`0`:为个人，`1`: 为团队（因为API基本一致，但区分个人和团队，为了减少代码量用`category`参数来指定知识库归属）
     */
    category: RepoCategory;

    /**
     * 知识库类型，支持的值：`Book`、`Design`、`all`
     */
    type: 'Book' | 'Design' | 'all';

    /**
     * 用于分页，效果类似 MySQL 的 limit offset，一页 20 条
     */
    offset: number;
}

export interface RepoListItem {
    id: number;
    type: 'Book' | 'Design' | 'all';
    slug: string;
    name: string;
    user_id: number;
    description: string;
    creator_id: number;
    public: number;
    items_count: number;
    likes_count: number;
    watches_count: number;
    content_updated_at: string;
    created_at: string;
    updated_at: string;
    user: any;
    namespace: string,
    _serializer: string;
}

export interface RepoDetails {
    id: number;
    type: 'Book' | 'Design' | 'all';
    slug: string;
    name: string;
    user_id: number;
    description: string;
    creator_id: number;
    public: number;
    items_count: number;
    likes_count: number;
    watches_count: number;
    content_updated_at: string;
    created_at: string;
    toc_yml: string;
    user: any;
    namespace: string;
    _serializer: string;
}


export interface RepoDocTreeMenu {
    uuid: string;
    type: string;
    title: string;
    url: string;
    slug: string;
    id: string;
    doc_id: string;
    level: number;
    depth: number;
    open_window: number;
    visible: number;
    prev_uuid: string;
    sibling_uuid: string;
    child_uuid: string;
    parent_uuid: string;
}

export interface DocDetails {
    id: number;
    type: string;
    slug: string;
    title: string;
    book_id: string;
    format: string;
    body: string;
    body_html: string;
}