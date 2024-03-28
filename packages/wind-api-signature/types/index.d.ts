interface ApiSignatureRequest {
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

interface ApiSigner {
    /**
     * 生成签名
     *
     * @param request   签名请求
     * @param secretKey 签名秘钥
     * @return 签名结果
     */
    sign: (request: ApiSignatureRequest, secretKey: string) => string;
    /**
     * 签名验证
     *
     * @param request   用于验证签名的请求
     * @param secretKey 签名秘钥
     * @param sign      待验证的签名
     * @return 签名验证是否通过
     */
    verify: (request: ApiSignatureRequest, secretKey: string, sign: string) => boolean;
}

interface ApiSecretAccount {
    /**
     * AccessKey or AppId
     * 账号访问唯一标识
     */
    accessId: string;
    /**
     * 签名秘钥
     */
    secretKey: string;
    /**
     * 秘钥版本
     */
    secretVersion?: string;
}
interface ApiRequestSingerOptions {
    /**
     * 签名请求头前缀
     */
    headerPrefix?: string;
    /**
     * 开启调试模式
     */
    debug?: boolean;
}
interface ApiRequestSignResult {
    /**
     * 签名的请求头
     */
    headers: Record<string, string>;
    /**
     * 仅在 debug 模式下返回
     */
    debugObject?: {
        request: ApiSignatureRequest;
        signatureText: string;
        queryString: string;
    };
}
declare class ApiRequestSinger {
    private readonly secretAccount;
    private readonly apiSigner;
    private readonly options;
    constructor(secretAccount: ApiSecretAccount, apiSigner: ApiSigner, options: ApiRequestSingerOptions);
    static hmacSha256: (secretAccount: ApiSecretAccount, options?: ApiRequestSingerOptions) => ApiRequestSinger;
    static sha256WithRsa: (secretAccount: ApiSecretAccount, options?: ApiRequestSingerOptions) => ApiRequestSinger;
    /**
     * 签名请求
     * @param request
     * @return 签名请求头对象
     */
    sign: (request: Omit<ApiSignatureRequest, "nonce" | "timestamp">) => ApiRequestSignResult;
}

export { ApiRequestSignResult, ApiRequestSinger, ApiRequestSingerOptions, ApiSecretAccount, ApiSignatureRequest, ApiSigner };
