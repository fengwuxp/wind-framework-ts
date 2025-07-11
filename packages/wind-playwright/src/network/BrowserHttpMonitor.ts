import {QueryParamMathType} from "../http/match/RequestMatcher";
import {HeaderValueMatchType} from "../http/match/HttpMatcher";
import {ReadyOnlyHttpRequest, ReadyOnlyHttpResponse} from "../http/Http";
import {Page} from "playwright-core";

export type HttpReadOnlyEvent<REQ = any, RESP = any> = {
    request: ReadyOnlyHttpRequest<REQ>;
    response: ReadyOnlyHttpResponse<RESP>;
}

export interface HttpEventListenerBuilder {

    referer: (refer: string) => HttpEventListenerBuilder;

    headers: (headers: Record<string, HeaderValueMatchType>) => HttpEventListenerBuilder;

    queryPrams: (queryParams: QueryParamMathType) => HttpEventListenerBuilder;

    or: () => HttpEventListenerBuilder

    once: (func: (event: HttpReadOnlyEvent) => void) => void;

    on: (func: (event: HttpReadOnlyEvent) => void) => void;

}

/**
 * 浏览器网络 http 请求监听
 */
export interface BrowserHttpMonitor {

    start: () => Promise<void>;

    dispose: () => Promise<void>;

    waitForSuccess: <REQ = any, RESP = any>(requestPattern: string, before?: (page: Page) => Promise<void>) => Promise<HttpReadOnlyEvent<REQ, RESP>>;

    waitForResponse: <T>(requestPattern: string, before?: (page: Page) => Promise<void>) => Promise<ReadyOnlyHttpResponse<T>>;

    /**
     * Monitor matching HTTP requests by pattern (e.g. URL or method).
     * @param requestPattern - Ant-style pattern or substring to match request URLs，example GET /api/v1/** or /api/v1/users/1
     */
    onRequest: (requestPattern: string) => HttpEventListenerBuilder;
}


export type MonitorHandle<T> = (data: T) => void

