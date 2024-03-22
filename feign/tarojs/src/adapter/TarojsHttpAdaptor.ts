import {HttpAdapter, HttpMethod, HttpRequestContextAttributes, HttpResponse} from "wind-http";
import {TarojsHttpRequest} from "./TarojsHttpRequest";

type TarojsHttpResponse = {
    /** 开发者服务器返回的数据 */
    data: any
    /** 开发者服务器返回的 HTTP Response Header */
    header: Record<string, any>;
    /** 开发者服务器返回的 HTTP 状态码 */
    statusCode: number
    /** 调用结果 */
    errMsg: string
    /** cookies */
    cookies?: string[]
};

type TarojsHttpRequestOptions = {
    /** 开发者服务器接口地址 */
    url: string
    /** 请求的参数 */
    data?: any
    /** 设置请求的 header，header 中不能设置 Referer。
     *
     * `content-type` 默认为 `application/json`
     */
    header?: Record<string, any>;
    /** 超时时间，单位为毫秒
     * @default 60000
     * @supported weapp, h5, tt, alipay, rn
     */
    timeout?: number;
    /** HTTP 请求方法
     * @default "GET"
     */
    method?: HttpMethod;
    /** 返回的数据格式 */
    dataType?: 'json' | 'text' | 'base64' | 'arraybuffer' | string
    /** 响应的数据类型 */
    responseType?: 'json' | 'text' | 'base64' | 'arraybuffer' | string
    /** 开启 http2
     * @default false
     * @supported weapp
     */
    enableHttp2?: boolean
    /** 开启 quic
     * @default false
     * @supported weapp
     */
    enableQuic?: boolean
    /** 开启 cache
     * @default false
     * @supported weapp, tt
     */
    enableCache?: boolean
    /** 是否开启 HttpDNS 服务。如开启，需要同时填入 httpDNSServiceId 。 HttpDNS 用法详见 移动解析HttpDNS
     * @default false
     * @supported weapp
     */
    enableHttpDNS?: boolean
    /** HttpDNS 服务商 Id。 HttpDNS 用法详见 移动解析HttpDNS
     * @supported weapp
     */
    httpDNSServiceId?: string
    /** 开启 transfer-encoding chunked。
     * @default false
     * @supported weapp
     */
    enableChunked?: boolean
    /**
     * wifi下使用移动网络发送请求
     * @default false
     * @supported weapp
     */
    forceCellularNetwork?: boolean
    /**
     * headers 中设置 cookie 字段是否生效。如果为 false，则 headers 中的 cookie 字段将被忽略，请求头中将包含服务端上一次返回的 cookie（如果有）。
     * @default false
     * @supported alipay 支付宝: 10.2.33+
     */
    enableCookie?: boolean
    /**
     * referer 策略，用于控制当前请求 header 对象中 referer 字段格式。该参数默认值可通过 app.json 中的配置进行修改。
     * @default "querystring"
     * @supported alipay 支付宝: 10.3.50+ APPX: 2.8.7 开发者工具: 3.5.1
     * @see https://opendocs.alipay.com/mini/api/owycmh#referrerStrategy%20%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E
     */
    referrerStrategy?: 'index' | 'page' | 'querystring'

    /** 设置是否使用 jsonp 方式获取数据
     * @default false
     * @supported h5
     */
    jsonp?: boolean | string
    /** 设置 jsonp 请求 url 是否需要被缓存
     * @supported h5
     */
    jsonpCache?: RequestCache

    /** 设置是否允许跨域请求
     * @default "same-origin"
     * @supported h5
     */
    mode?: 'no-cors' | 'cors' | 'same-origin'
    /** 设置是否携带 Cookie
     * @default "omit"
     * @supported h5
     */
    credentials?: 'include' | 'omit' | 'same-origin'
    /** 设置缓存模式
     * @default "default"
     * @supported h5
     */
    cache?: keyof Cache
    /** 设置请求重试次数
     * @default 2
     * @supported h5
     * @h5 仅在 jsonp 模式下生效
     */
    retryTimes?: number
    /** 设置请求的兜底接口
     * @supported h5
     * @h5 仅在 jsonp 模式下生效
     */
    backup?: string | string[]
    /** 设置请求中止信号
     * @supported h5
     */
    signal?: AbortSignal
    /** 设置请求响应的数据校验函数，若返回 false，则请求兜底接口，若无兜底接口，则报请求失败
     * @supported h5
     * @h5 仅在 jsonp 模式下生效
     */
    dataCheck?(): boolean
    /** 设置请求是否使用缓存
     * @default false
     * @supported h5
     * @h5 仅在 jsonp 模式下生效
     */
    useStore?: boolean
    /** 设置请求缓存校验的 key
     * @supported h5
     * @h5 仅在 jsonp 模式下生效
     */
    storeCheckKey?: string
    /** 设置请求缓存签名
     * @supported h5
     * @h5 仅在 jsonp 模式下生效
     */
    storeSign?: string
    /** 设置请求校验函数，一般不需要设置
     * @supported h5
     */
    storeCheck?(): boolean
};

export type TarojsHttpRequester = (request: TarojsHttpRequestOptions) => Promise<TarojsHttpResponse>;

/**
 * tarojs http adaptor
 */
export default class TarojsHttpAdaptor implements HttpAdapter<TarojsHttpRequest> {

    private readonly tarojsHttpFetch: TarojsHttpRequester;

    private readonly timeout: number;

    /**
     * @param tarojsHttpFetch tarojs request function
     * @param timeout  default 30000ms
     */
    constructor(tarojsHttpFetch: TarojsHttpRequester, timeout?: number) {
        this.tarojsHttpFetch = tarojsHttpFetch;
        this.timeout = timeout || 30 * 1000;
    }

    send = (req: TarojsHttpRequest, context: HttpRequestContextAttributes): Promise<HttpResponse> => {
        return this.tarojsHttpFetch(this.buildRequest(req)).then((resp) => {
            const ok = resp.statusCode >= 200 && resp.statusCode < 300;
            return {
                data: resp.data,
                headers: resp.header,
                ok,
                statusCode: resp.statusCode
            }
        });
    };

    private buildRequest = (options: TarojsHttpRequest): TarojsHttpRequestOptions => {
        const {
            url,
            body,
            method,
            headers,
            credentials,
            mode,
            cache,
            dataType,
            responseType
        } = options;
        return {
            //请求方法get post
            method: method as any,
            //请求url
            url,
            //响应类型,,
            dataType: dataType as any,
            responseType: responseType as any,
            cache: (cache as any),
            credentials,
            mode: (mode as any),
            //headers HTTP 请求头
            header: headers,
            data: body,
            timeout: this.timeout
        };

    };
}
