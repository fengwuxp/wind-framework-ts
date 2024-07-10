export interface GroupListItem {
    id: number;
    user_id: number;
    organization_id: number;
    type: string;
    icon: string;
    title: string;
    url: string;
    order_num: number;
    target_id: number;
    target_type: string;
    created_at: string;
    updated_at: string;
    ref_id: string;
    target: {
        id: number;
        login: string;
        name: string;
    },
    user: any;
}

export interface GroupBook extends Record<string, any> {
    id: number;
    slug: string;
    name: string;
}

export interface GroupBookStacksDetails {
    id: number;
    created_at: string;
    updated_at: string;
    user_id: number;
    display_type: number;
    name: string;
    rank: number;
    is_default?: boolean,
    organization_id: number;
    show_book_icon: number;
    show_book_desc: number;
    show_doc_updated_at: number;
    doc_order_type: number;
    books: Array<GroupBook>;
}

export interface DocListItem extends Record<string, any> {
    id: number;
    space_id: number;
    type: "Doc" | "Sheet";
    sub_type: string;
    title: string;
    title_draft: string;
    tag: string;
    slug: string;
    user_id: number;
    book_id: number;
    last_editor_id: number;
    format: string;
    status: number;
    read_status: number;
    view_status: number;
    public: number;
    draft_version: number;
    comments_count: number;
    likes_count: number;
    word_count: number;
    region: string;
}