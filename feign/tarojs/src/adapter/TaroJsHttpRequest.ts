import {HttpRequest} from "wind-http";


export interface TaroJsHttpRequest extends HttpRequest{

    /**
     * referrer
     */
    referrer?: string;


    referrerPolicy?: ReferrerPolicy;

    /**
     * 请求的模式，主要用于跨域设置，cors, no-cors, same-origin
     */
    mode?: RequestMode;

    /**
     * 是否发送Cookie
     */
    credentials?: RequestCredentials;

    /**
     * 收到重定向请求之后的操作，follow, error, manual
     */
    redirect?: RequestRedirect;

    /**
     * 缓存模式
     */
    cache?: RequestCache;

    /**
     * 完整性校验
     */
    integrity?: string;

    /**
     * 如果设为 json，会尝试对返回的数据做一次 JSON.parse
     * @default json
     */
    dataType?: string
    /**
     * 设置响应的数据类型。合法值：text、arraybuffer
     * @default text
     */
    responseType?: string
    /**
     * 设置 H5 端是否使用jsonp方式获取数据
     * @default false
     */
    jsonp?: boolean
    /**
     * 设置 H5 端 jsonp 请求 url 是否需要被缓存
     * @default false
     */
    jsonpCache?: boolean
}
