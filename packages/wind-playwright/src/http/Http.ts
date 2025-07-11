import {HttpMethod} from "wind-http";

export enum HttpScheme {

    http = "http://",

    https = "https://",
}

export enum HttpHeaderNames {

    referer = "referer",

    contentType = "content-type",
}

export interface ReadyOnlyHttpHeaders {
    get: (name: string, defaultValue?: string) => string | undefined;
    has: (name: string) => boolean;
    headerNames: () => Array<string>;
    forEach: (callback: (name: string, value: string) => void) => void
}


/**
 * query params type
 */
export type ReadOnlyQueryParams = Record<string, string | string[]>;


export interface ReadyOnlyHttpRequest<T = any> {

    /**
     * 包含查询参数
     */
    readonly url: URL;

    /**
     * 不带查询参数 {@link #queryParams}
     */
    readonly originalUrl: string

    readonly queryParams: ReadOnlyQueryParams;

    readonly method: HttpMethod;

    readonly headers: ReadyOnlyHttpHeaders;

    readonly body?: T;
}

export interface ReadyOnlyHttpResponse<T = any> {

    readonly ok: boolean;

    readonly status: number;

    readonly statusText: string | null;

    readonly headers: ReadyOnlyHttpHeaders;

    readonly body?: T;
}


export const wrapperReadyOnlyHeaders = (headers: Record<string, string>): ReadyOnlyHttpHeaders => {

    return {
        forEach: (callback: (name: string, value: string) => void): void => {
            for (const name in headers) {
                callback(name, headers[name]);
            }
        },
        get: (name: string, defaultValue: string | undefined): string | undefined => {
            return headers[name] ?? defaultValue;
        },

        has: (name: string) => {
            return name in headers;
        },

        headerNames: (): Array<string> => {
            return Object.keys(headers);
        }
    }
}