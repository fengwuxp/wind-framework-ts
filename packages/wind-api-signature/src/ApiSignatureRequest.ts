import md5 from 'md5';

export interface ApiSignatureRequest {

    /**
     * http 请求方法
     */
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

    /**
     * http 请求 path，不包含查询参数和域名
     */
    requestPath: string;

    /**
     * 32 位字符串
     */
    nonce: string;

    /**
     * 时间戳
     */
    timestamp: string;

    /**
     * 查询参数
     */
    queryParams?: Record<string, any>;

    /**
     * 请求体，根据 content-type 序列化好的字符串
     */
    requestBody?: string;
}


/**
 * 获取标准化查询字符串 ，key 按照字典序排序
 * @param queryParams
 */
export const getCanonicalizedQueryString = (queryParams?: Record<string, any>) => {
    const isNoneNullObject = (val) => {
        return !(val === null || val === undefined);

    }
    const hasText = (val) => {
        return isNoneNullObject(val) && typeof val === "string" && val.trim().length > 0;
    }
    const joiner = (key, val) => {
        return isNoneNullObject(val) ? `${key}=${val}` : null;
    }
    if (queryParams && Object.keys(queryParams).length > 0) {
        return Object.keys(queryParams).sort().map((key) => {
            const val = queryParams[key];
            if (Array.isArray(val)) {
                return val.filter(isNoneNullObject).map(value => joiner(key, value)).filter(hasText).join("&")
            }
            return joiner(key, val);
        }).filter(hasText).join("&");
    }
}

const fields = [
    "method",
    "requestPath",
    "nonce",
    "timestamp",
];

/**
 * 获取摘要签名字符串
 * @param request
 */
export const getSignTextForDigest = (request: ApiSignatureRequest) => {
    let result = fields.map(field => {
        return `${field}=${request[field]}`
    }).join("&");
    const queryString = getCanonicalizedQueryString(request.queryParams);
    if (queryString != null && queryString.trim().length > 0) {
        result += `&queryStringMd5=${md5(queryString)}`;
    }
    if (request.requestBody) {
        result += `&requestBodyMd5=${md5(request.requestBody)}`;
    }
    return result;
}

/**
 * 获取 sha256 with rsa 签名字符串
 * @param request
 */
export const getSignTextForSha256WithRsa = (request: ApiSignatureRequest) => {
    return `${request.method} ${request.requestPath}\n` +
        `${request.timestamp}\n` +
        `${request.nonce}\n` +
        `${getCanonicalizedQueryString(request.queryParams) ?? ''}\n` +
        `${request.requestBody ?? ''}\n`;
}