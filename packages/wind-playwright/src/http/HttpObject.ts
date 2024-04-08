import {
    ReadOnlyQueryParams,
    ReadyOnlyHttpHeaders,
    ReadyOnlyHttpRequest,
    ReadyOnlyHttpResponse,
    wrapperReadyOnlyHeaders
} from "./Http";
import {HttpMethod} from "wind-http";
import * as querystring from "querystring";
import {Request, Response} from "playwright";

export const getWithoutQueryStringUri = (url: string) => {
    const uri = url.split("?")[0];
    return uri.endsWith("/") ? uri.substring(0, uri.length - 1) : uri;
}

export class NativeReadyOnlyHttpRequest implements ReadyOnlyHttpRequest {
    readonly headers: ReadyOnlyHttpHeaders;
    readonly method: HttpMethod;
    readonly queryParams: ReadOnlyQueryParams;
    readonly url: URL;
    readonly originalUrl: string;
    readonly body?: any;

    constructor(request: Request) {
        // 移除 url 末尾的 /
        this.originalUrl = getWithoutQueryStringUri(request.url())
        this.url = new URL(request.url());
        this.queryParams = querystring.parse(this.url.search) as ReadOnlyQueryParams;
        this.method = request.method() as HttpMethod;
        this.headers = wrapperReadyOnlyHeaders(request.headers());
        this.body = request.postData();
    }
}

export class NativeReadyOnlyHttpResponse implements ReadyOnlyHttpResponse {
    readonly headers: ReadyOnlyHttpHeaders;
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string | null;
    body: any;

    constructor(response: Response) {
        this.ok = response.ok();
        this.status = response.status();
        this.statusText = response.statusText();
        this.headers = wrapperReadyOnlyHeaders(response.headers())
        this.body = null;
    }

    setBody = (body: any) => {
        this.body = body;
    }
}