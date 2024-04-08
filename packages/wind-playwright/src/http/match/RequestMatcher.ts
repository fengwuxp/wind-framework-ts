import {HttpHeaderNames, HttpScheme, ReadOnlyQueryParams, ReadyOnlyHttpRequest} from "../Http";
import {
    AnyTextMatcher,
    HeaderValueMatchType,
    HttpHeadersMatcher,
    HttpMatcher,
    HttpMatcherFactory,
    HttpMatchesOps
} from "./HttpMatcher";
import * as querystring from "querystring";
import AntPathMatcher from "wind-common-utils/lib/match/AntPathMatcher";

export interface RequestMatcher<R extends ReadyOnlyHttpRequest = ReadyOnlyHttpRequest> extends HttpMatcher<R> {

}

export type QueryParamMathType = Record<string, string> | string | undefined


/**
 * 查询参数匹配器
 * 如果 {@link #expect} 为空，则总是匹配
 * @see AnyTextMatcher
 */
class QueryParamsMatcher implements HttpMatcher<ReadOnlyQueryParams | string> {

    private readonly expect: Record<string, string> | undefined;

    constructor(queryParams: QueryParamMathType) {
        if (typeof queryParams === "string") {
            this.expect = querystring.parse(queryParams) as Record<string, string>;
        } else {
            this.expect = queryParams;
        }
    }

    matches = (requestParams: ReadOnlyQueryParams | string): boolean => {
        const {expect} = this;
        if (expect == null || Object.keys(expect).length == 0) {
            return true;
        }
        const actualParams = this.getActualParams(requestParams);
        // 匹配参数
        return Object.keys(expect)
            .map((name) => {
                let param = actualParams[name];
                if (Array.isArray(param)) {
                    param = param.join(",");
                }
                return AnyTextMatcher.of(expect[name]).matches(param);
            })
            .reduce((prev, value) => {
                return prev && value;
            });
    }

    private getActualParams = (requestParams: ReadOnlyQueryParams | string) => {
        if (typeof requestParams === "string") {
            return querystring.parse(requestParams) as ReadOnlyQueryParams;
        } else {
            return requestParams;
        }
    }
}

/**
 * Ant Path url 匹配
 * 支持匹配 url path ,例如：/api/v1/**
 * 支持配置完整的 url 匹配 {@link #matchAll} 例如：https://*.a.b.c/api/v1/**
 * @see AntPathMatcher
 */
class AntPathUrlMatcher implements HttpMatcher<string> {

    private static readonly PATH_MATCHER = new AntPathMatcher();

    private readonly _expect: string;

    private readonly matchAll: boolean;

    constructor(pattern: string) {
        this._expect = pattern;
        this.matchAll = this._expect.startsWith(HttpScheme.http) || this._expect.startsWith(HttpScheme.https)
    }

    /**
     * 例如： /api/v1/test 、 /api/test 、 https://a.a.b.c/api/v1/test
     * @param url {url|uri}
     */
    matches = (url: string): boolean => {
        const {_expect, matchAll} = this;
        if (matchAll) {
            // 匹配完整的 url
            return AntPathUrlMatcher.PATH_MATCHER.match(_expect, url);
        }
        return AntPathUrlMatcher.PATH_MATCHER.match(_expect, new URL(url).pathname);
    }

    get pattern(): string {
        return this._expect;
    }
}

/**
 * 请求 referer 匹配
 */
class RefererRequestMatcher implements RequestMatcher {

    private readonly pathUrlMatcher: AntPathUrlMatcher;

    private readonly queryParamsMatcher: QueryParamsMatcher;

    constructor(referer: string) {
        const [pattern, query] = referer.split("?")
        this.pathUrlMatcher = new AntPathUrlMatcher(pattern);
        this.queryParamsMatcher = new QueryParamsMatcher(query);
    }

    matches = (request: ReadyOnlyHttpRequest): boolean => {
        const referer = request.headers.get(HttpHeaderNames.referer);
        if (referer == null) {
            return false;
        }
        const {pathUrlMatcher, queryParamsMatcher} = this;
        const [url, query] = referer.split("?")
        return pathUrlMatcher.matches(url) && queryParamsMatcher.matches(query ?? {})
    }
}

/**
 * 匹配请求参数
 */
class RequestQueryParamsMatcher implements RequestMatcher {

    private readonly queryParamsMatcher: QueryParamsMatcher;

    constructor(queryParams: QueryParamMathType) {
        this.queryParamsMatcher = new QueryParamsMatcher(queryParams);
    }

    matches = (request: ReadyOnlyHttpRequest): boolean => {
        return this.queryParamsMatcher.matches(request.queryParams);
    }
}

/**
 * 匹配请求头
 */
class RequestHeadersMatcher implements RequestMatcher {

    private readonly headersMatcher: HttpHeadersMatcher;

    constructor(headers: Record<string, HeaderValueMatchType>) {
        this.headersMatcher = new HttpHeadersMatcher(headers);
    }

    matches = (request: ReadyOnlyHttpRequest): boolean => {
        return this.headersMatcher.matches(request.headers);
    }
}

/**
 * 匹配请求方法和请求 url
 * @see HttpMethod
 * @see AntPathUrlMatcher
 */
export class AntRequestMatcher implements RequestMatcher {

    private readonly _pathUrlMatcher: AntPathUrlMatcher;

    private readonly method: string | undefined;

    /**
     * 格式 /{HttpMethod} {url}，例如：GET /api/v1/**、 GET http://*.example.com/api/v1/*
     * @param requestPattern
     */
    constructor(requestPattern: string) {
        if (requestPattern.includes(" ")) {
            const [method, pattern] = requestPattern.split(" ");
            this.method = method;
            this._pathUrlMatcher = new AntPathUrlMatcher(pattern);
        } else {
            this._pathUrlMatcher = new AntPathUrlMatcher(requestPattern);
        }
    }

    matches = (request: ReadyOnlyHttpRequest): boolean => {
        const {_pathUrlMatcher, method} = this;
        if (method != null && method !== request.method) {
            return false;
        }
        return _pathUrlMatcher.matches(request.originalUrl);
    }

    get pathUrlMatcher(): AntPathUrlMatcher {
        return this._pathUrlMatcher;
    }
}


export class RequestMatcherFactory {

    /**
     * @param rules referer
     * @param ops 每一个 referer pattern 连接的运算符
     * @return  {@link RefererRequestMatcher}
     */
    static referer = (rules: string[], ops?: HttpMatchesOps): RequestMatcher => {
        return RequestMatcherFactory.build<string>(RefererRequestMatcher, rules, ops)
    }

    /**
     * @param rules ant patch
     * @param ops 每一个 request pattern 连接的运算符
     * @return {@link AntRequestMatcher}
     */
    static antRequest = (rules: string[], ops?: HttpMatchesOps): RequestMatcher => {
        return RequestMatcherFactory.build<string>(AntRequestMatcher, rules, ops)
    }

    /**
     * @param rules 请求头匹配规则
     * @param ops 每一个 header matchers 连接的运算符
     * @return {@link RequestHeadersMatcher}
     */
    static headers = (rules: Record<string, HeaderValueMatchType>[], ops?: HttpMatchesOps): RequestMatcher => {
        return RequestMatcherFactory.build<Record<string, HeaderValueMatchType>>(RequestHeadersMatcher, rules, ops)
    }

    /**
     * @param rules 查询参数匹配规则
     * @param ops 每一个 header matchers 连接的运算符
     * @return {@link RequestHeadersMatcher}
     */
    static queryPrams = (rules: QueryParamMathType[], ops?: HttpMatchesOps): RequestMatcher => {
        return RequestMatcherFactory.build<QueryParamMathType>(RequestQueryParamsMatcher, rules, ops)
    }

    private static build = <S>(matcherConstructor: {
        new(args: S): RequestMatcher
    }, rules: Array<S>, ops?: HttpMatchesOps): RequestMatcher => {
        return HttpMatcherFactory.buildMatcher<ReadyOnlyHttpRequest, S>(matcherConstructor, rules, ops)
    }
}