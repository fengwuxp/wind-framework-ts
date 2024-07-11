export interface GroupListItem {
    id: number;
    type: string;
    login: string;
    name: string;
    description: string;
    avatar?: string;
    avatar_url: string;
    owner_id: number;
    books_count: number;
    public: number;
    extend_private: number;
    scene: string;
    created_at: string;
    updated_at: string;
    organization_id: number;
    isPaid: boolean;
    member_level: number;
    hasMemberLevel: boolean;
    isTopLevel: boolean;
    grains_sum: number;
    status: number;
    source: null,
    zone_id: number;
    isPermanentPunished: boolean;
    isWiki: boolean;
    isPublicPage: boolean;
    owners: Array<any>,
    _serializer: string;
}

export interface PublicBookGroup {
    created_at: string;
    display_type: number;
    doc_order_type: 1
    id: number;
    is_default: null
    name: string;
    organization_id: number;
    rank: number;
    show_book_desc: number;
    show_book_icon: number;
    show_doc_updated_at: number;
    books: Array<GroupBook>;
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