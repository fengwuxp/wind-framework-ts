import { NetworkStatusListener, NetworkStatus, HttpRequest, HttpAdapter, HttpRequestContextAttributes, HttpResponse } from 'wind-http';

/**
 * react-native network status listener
 */
declare class ReactNativeNetworkStatusListener implements NetworkStatusListener {
    getNetworkStatus: () => Promise<NetworkStatus>;
    onChange: (callback: (networkStatus: NetworkStatus) => void) => void;
    private processNetworkStats;
    private converterStateType;
}

interface ReactNativeHttpRequest extends HttpRequest {
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
     * 长连接
     */
    keepalive?: boolean;
    window?: any;
}

/**
 *  react-native http request adapter
 */
declare class ReactNativeHttpAdapter implements HttpAdapter<ReactNativeHttpRequest> {
    private readonly timeout;
    /**
     * @param timeout  default 3000ms
     */
    constructor(timeout?: number);
    send: (request: ReactNativeHttpRequest, context: HttpRequestContextAttributes) => Promise<HttpResponse>;
    /**
     * build http request
     * @param {ReactNativeHttpRequest} request
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
    private paresBlob;
}

export { ReactNativeHttpAdapter, ReactNativeHttpRequest, ReactNativeNetworkStatusListener };
