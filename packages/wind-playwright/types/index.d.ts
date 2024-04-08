import { HttpMethod } from 'wind-http';
import EventEmitter from 'eventemitter3';
import { Page, Request, Response } from 'playwright';

declare enum HttpScheme {
    http = "http://",
    https = "https://"
}
declare enum HttpHeaderNames {
    referer = "referer",
    contentType = "content-type"
}
interface ReadyOnlyHttpHeaders {
    get: (name: string, defaultValue?: string) => string | undefined;
    has: (name: string) => boolean;
    headerNames: () => Array<string>;
    forEach: (callback: (name: string, value: string) => void) => void;
}
/**
 * query params type
 */
type ReadOnlyQueryParams = Record<string, string | string[]>;
interface ReadyOnlyHttpRequest {
    /**
     * 包含查询参数
     */
    readonly url: URL;
    /**
     * 不带查询参数 {@link #queryParams}
     */
    readonly originalUrl: string;
    readonly queryParams: ReadOnlyQueryParams;
    readonly method: HttpMethod;
    readonly headers: ReadyOnlyHttpHeaders;
    readonly body?: any;
}
interface ReadyOnlyHttpResponse<T = any> {
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string | null;
    readonly headers: ReadyOnlyHttpHeaders;
    readonly body?: T;
}
declare const wrapperReadyOnlyHeaders: (headers: Record<string, string>) => ReadyOnlyHttpHeaders;

type HeaderValueMatchType = (val: string) => boolean | string;
interface HttpMatcher<R> {
    matches: (request: R) => boolean;
}
declare enum HttpMatchesOps {
    OR = "OR",
    AND = "AND"
}
/**
 * 字符串匹配器
 * 如果 {@link #expect} 为 "*"，匹配任意字符串，否则必须完全匹配
 */
declare class AnyTextMatcher implements HttpMatcher<string> {
    private readonly expect;
    private constructor();
    static of: (text: string) => AnyTextMatcher;
    matches: (text: string) => boolean;
}
/**
 * http headers 匹配器
 * 如果 {@link #expect} 为空，则总是匹配
 * 如果 {@link #expect} 的 value 类型为 {@link HeaderValueMatchType}，看函数返回值
 * @see AnyTextMatcher
 */
declare class HttpHeadersMatcher implements HttpMatcher<ReadyOnlyHttpHeaders> {
    private readonly expect;
    constructor(headers: Record<string, HeaderValueMatchType | string>);
    matches: (httpHeaders: ReadyOnlyHttpHeaders) => boolean;
}
declare class HttpMatcherFactory {
    static any: <R>(delegates: HttpMatcher<R>[]) => HttpMatcher<R>;
    static all: <R>(delegates: HttpMatcher<R>[]) => HttpMatcher<R>;
    static alwaysFalse: <R>() => HttpMatcher<R>;
    static alwaysTrue: <R>() => HttpMatcher<R>;
    static ops: <R>(matchers: HttpMatcher<R>[], ops: HttpMatchesOps) => HttpMatcher<R>;
    static buildMatcher: <R, S>(matcherConstructor: new (args: S) => HttpMatcher<R>, rules: S[], ops?: HttpMatchesOps) => HttpMatcher<R>;
}

interface RequestMatcher<R extends ReadyOnlyHttpRequest = ReadyOnlyHttpRequest> extends HttpMatcher<R> {
}
type QueryParamMathType = Record<string, string> | string | undefined;
/**
 * Ant Path url 匹配
 * 支持匹配 url path ,例如：/api/v1/**
 * 支持配置完整的 url 匹配 {@link #matchAll} 例如：https://*.a.b.c/api/v1/**
 * @see AntPathMatcher
 */
declare class AntPathUrlMatcher implements HttpMatcher<string> {
    private static readonly PATH_MATCHER;
    private readonly _expect;
    private readonly matchAll;
    constructor(pattern: string);
    /**
     * 例如： /api/v1/test 、 /api/test 、 https://a.a.b.c/api/v1/test
     * @param url {url|uri}
     */
    matches: (url: string) => boolean;
    get pattern(): string;
}
/**
 * 匹配请求方法和请求 url
 * @see HttpMethod
 * @see AntPathUrlMatcher
 */
declare class AntRequestMatcher implements RequestMatcher {
    private readonly _pathUrlMatcher;
    private readonly method;
    /**
     * 格式 /{HttpMethod} {url}，例如：GET /api/v1/**、 GET http://*.example.com/api/v1/*
     * @param requestPattern
     */
    constructor(requestPattern: string);
    matches: (request: ReadyOnlyHttpRequest) => boolean;
    get pathUrlMatcher(): AntPathUrlMatcher;
}
declare class RequestMatcherFactory {
    /**
     * @param rules referer
     * @param ops 每一个 referer pattern 连接的运算符
     * @return  {@link RefererRequestMatcher}
     */
    static referer: (rules: string[], ops?: HttpMatchesOps) => RequestMatcher;
    /**
     * @param rules ant patch
     * @param ops 每一个 request pattern 连接的运算符
     * @return {@link AntRequestMatcher}
     */
    static antRequest: (rules: string[], ops?: HttpMatchesOps) => RequestMatcher;
    /**
     * @param rules 请求头匹配规则
     * @param ops 每一个 header matchers 连接的运算符
     * @return {@link RequestHeadersMatcher}
     */
    static headers: (rules: Record<string, HeaderValueMatchType>[], ops?: HttpMatchesOps) => RequestMatcher;
    /**
     * @param rules 查询参数匹配规则
     * @param ops 每一个 header matchers 连接的运算符
     * @return {@link RequestHeadersMatcher}
     */
    static queryPrams: (rules: QueryParamMathType[], ops?: HttpMatchesOps) => RequestMatcher;
    private static build;
}

interface ResponseMatcher<R extends ReadyOnlyHttpResponse = ReadyOnlyHttpResponse> extends HttpMatcher<R> {
}
type HttpStatusRangeMatchType = {
    begin: number;
    end: number;
};
declare class ResponseMatcherFactory {
    /**
     * @param rules 响应头匹配规则
     * @param ops 每一个 header matchers 连接的运算符
     * @return {@link ResponseHeadersMatcher}
     */
    static headers: (rules: Record<string, HeaderValueMatchType>[], ops?: HttpMatchesOps) => ResponseMatcher;
    /**
     * @param rules http status 匹配
     * @param ops  连接的运算符
     * @return {@link HttpStatusMatcher}
     */
    static status: (rules: Array<HttpStatusRangeMatchType>, ops?: HttpMatchesOps) => ResponseMatcher;
    /**
     * @return {@link RequestHeadersMatcher}
     */
    static ok: () => ResponseMatcher;
    static medialType: (rules: Array<string>) => ResponseMatcher;
    static json: () => ResponseMatcher;
    private static build;
}

interface BrowserNetworkMonitor {
    start: () => Promise<void>;
    destroy: () => Promise<void>;
}
type MonitorHandle<T> = (data: T) => void;

type HttpReadOnlyEvent = {
    request: ReadyOnlyHttpRequest;
    response: ReadyOnlyHttpResponse;
};
type PlaywrightHttpResponse<T> = Promise<ReadyOnlyHttpResponse<T>>;
type MatcherManager = {
    add: (matcher: RequestMatcher) => void;
    remove: (matcher: RequestMatcher) => void;
};
declare class HttpEventListenerBuilder {
    private left;
    private ops;
    private readonly requestPattern;
    private readonly emitter;
    private readonly matcherManager;
    constructor(requestPattern: string, emitter: EventEmitter, matcherManager: MatcherManager);
    referer: (refer: string) => HttpEventListenerBuilder;
    headers: (headers: Record<string, HeaderValueMatchType>) => HttpEventListenerBuilder;
    queryPrams: (queryParams: QueryParamMathType) => HttpEventListenerBuilder;
    or: () => HttpEventListenerBuilder;
    private combineRequestMatcher;
    once: (func: (event: HttpReadOnlyEvent) => void) => () => void;
    on: (func: (event: HttpReadOnlyEvent) => void) => () => void;
    private listen;
}
/**
 * http 请求监听器
 */
declare class HttpMonitor implements BrowserNetworkMonitor {
    readonly page: Page;
    private readonly httpMatcherHolder;
    private readonly emitter;
    private readonly requestMatchers;
    private constructor();
    static of: (page: Page) => HttpMonitor;
    start: () => Promise<void>;
    destroy: () => Promise<void>;
    /**
     * 等待接口 2xx 响应
     * @param url
     * @param method
     * @param before
     */
    wait2xx: (url: string, method: HttpMethod, before?: (page: Page) => Promise<void>) => Promise<HttpReadOnlyEvent>;
    /**
     * 等待接口 2xx 响应
     * @param url
     * @param method
     * @param before
     */
    wait2xxResponse: <T>(url: string, method: HttpMethod, before?: (page: Page) => Promise<void>) => Promise<ReadyOnlyHttpResponse<T>>;
    /**
     * const destroyFn= on("")
     * .referer()
     *  .and()
     * .(queryParams)
     *  or()
     * .headers()
     * .handle((data)=>{
     *
     * })
     * destroyFn()
     * @param url
     * @param method
     */
    request: (url: string, method?: HttpMethod) => HttpEventListenerBuilder;
    /**
     * @param requestPattern
     */
    removeAllListeners: (requestPattern: string) => this;
}

declare const getWithoutQueryStringUri: (url: string) => string;
declare class NativeReadyOnlyHttpRequest implements ReadyOnlyHttpRequest {
    readonly headers: ReadyOnlyHttpHeaders;
    readonly method: HttpMethod;
    readonly queryParams: ReadOnlyQueryParams;
    readonly url: URL;
    readonly originalUrl: string;
    readonly body?: any;
    constructor(request: Request);
}
declare class NativeReadyOnlyHttpResponse implements ReadyOnlyHttpResponse {
    readonly headers: ReadyOnlyHttpHeaders;
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string | null;
    body: any;
    constructor(response: Response);
    setBody: (body: any) => void;
}

export { AntRequestMatcher, AnyTextMatcher, BrowserNetworkMonitor, HeaderValueMatchType, HttpHeaderNames, HttpHeadersMatcher, HttpMatcher, HttpMatcherFactory, HttpMatchesOps, HttpMonitor, HttpScheme, HttpStatusRangeMatchType, MonitorHandle, NativeReadyOnlyHttpRequest, NativeReadyOnlyHttpResponse, PlaywrightHttpResponse, QueryParamMathType, ReadOnlyQueryParams, ReadyOnlyHttpHeaders, ReadyOnlyHttpRequest, ReadyOnlyHttpResponse, RequestMatcher, RequestMatcherFactory, ResponseMatcher, ResponseMatcherFactory, getWithoutQueryStringUri, wrapperReadyOnlyHeaders };
