import { HttpRequest, HttpAdapter, HttpMediaType, HttpRequestContextAttributes, HttpResponse, NetworkStatusListener, NetworkStatus } from 'wind-http';

interface BrowserHttpRequest extends HttpRequest {
    /**
     * referrer
     */
    referrer?: string;
    /**
     * referrer policy
     */
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
     * 长连接
     */
    keepalive?: boolean;
    window?: any;
}

/**
 *  browser http request adapter
 */
declare class BrowserHttpAdapter implements HttpAdapter<BrowserHttpRequest> {
    private readonly timeout;
    private readonly defaultOptions;
    private readonly consumes;
    /**
     *
     * @param timeout  default 1min
     * @param defaultOptions
     * @param consumes  default 'application/json;charset=UTF-8'
     */
    constructor(timeout?: number, defaultOptions?: RequestInit, consumes?: HttpMediaType);
    send: (request: BrowserHttpRequest, context: HttpRequestContextAttributes) => Promise<HttpResponse>;
    /**
     * build http request
     * @param {BrowserHttpRequest} request
     * @return {Request}
     */
    private buildRequest;
    private convertResponse;
    /**
     * parse response data
     * @param response
     * @return {any}
     */
    private parseResponse;
    private parseJSON;
    private parseText;
    private paresArrayBuffer;
    private getHeaderByName;
    /**
     * http Transfer-Encoding
     * @param headers
     */
    private hasTransferEncoding;
}

/**
 * browser network status listener
 */
declare class BrowserNetworkStatusListener implements NetworkStatusListener {
    getNetworkStatus: () => Promise<NetworkStatus>;
    onChange: (callback: (networkStatus: NetworkStatus) => void) => void;
    private processNetworkStats;
    private converterStateType;
    private getBrowserNetworkStatus;
}

export { BrowserHttpAdapter, type BrowserHttpRequest, BrowserNetworkStatusListener };
