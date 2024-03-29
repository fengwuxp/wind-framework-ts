export enum QueryType {

    /**
     * 查询总数
     */
    COUNT_TOTAL = "COUNT_TOTAL",

    /**
     * 查询结果集
     */
    QUERY_RESET = "QUERY_RESET",

    /**
     * 查询总数和结果集
     */
    QUERY_BOTH = "QUERY_RESET"
}

export enum QueryOrderType {

    /**
     * 升序
     */
    ASC = "ASC",

    DESC = "DESC"
}

/**
 * 默认的排序字段名称
 */
export enum DefaultOrderField {

    /**
     * 创建时间
     */
    GMT_CREATE = "GMT_CREATE",

    /**
     * 更新时间
     */
    GMT_MODIFIED = "GMT_MODIFIED",

    /**
     * 排序
     */
    ORDER_INDEX = "ORDER_INDEX",
}

export interface AbstractPageQuery<F = DefaultOrderField> {

    queryPage?: number;

    querySize?: number;

    queryType?: QueryType;

    /**
     * 排序字段
     */
    orderFields?: F[];

    /**
     * 排序类型
     */
    orderTypes?: QueryOrderType[];
}

/**
 * 分页对象
 */
export interface Pagination<T> {

    total: number;

    records: T[];

    queryPage: number;

    querySize: number;

    queryType: QueryType;
}

export interface ApiResponse<T> {

    data?: T;
    success: boolean;
    errorCode: string;
    errorMessage?: string;
    traceId: string;
}