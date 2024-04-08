import {HttpHeaderNames, ReadyOnlyHttpResponse} from "../Http";
import {HeaderValueMatchType, HttpHeadersMatcher, HttpMatcher, HttpMatcherFactory, HttpMatchesOps} from "./HttpMatcher";
import {HttpMediaType, matchMediaType} from "wind-http";


export interface ResponseMatcher<R extends ReadyOnlyHttpResponse = ReadyOnlyHttpResponse> extends HttpMatcher<R> {

}

export type HttpStatusRangeMatchType = {
    begin: number;
    end: number;
}

/**
 * 匹配响应头
 */
class ResponseHeadersMatcher implements ResponseMatcher {

    private readonly headersMatcher: HttpHeadersMatcher;

    constructor(headers: Record<string, HeaderValueMatchType>) {
        this.headersMatcher = new HttpHeadersMatcher(headers);
    }

    matches = (response: ReadyOnlyHttpResponse): boolean => {
        return this.headersMatcher.matches(response.headers);
    }
}


class HttpStatusMatcher implements ResponseMatcher {

    private readonly begin: number;

    private readonly end: number;

    constructor({begin, end}: HttpStatusRangeMatchType) {
        if (begin > end) {
            throw new Error(`argument error, begin must less than end, begin: ${begin}, end: ${end}`);
        }
        this.begin = end;
        this.end = end;
    }

    matches = (response: ReadyOnlyHttpResponse): boolean => {
        const {begin, end} = this;
        const status = response.status;
        return status >= begin && status < end;
    }
}

class ResponseOkMatcher implements ResponseMatcher {

    matches = (response: ReadyOnlyHttpResponse): boolean => {
        return response.ok;
    }
}


export class ResponseMatcherFactory {

    /**
     * @param rules 响应头匹配规则
     * @param ops 每一个 header matchers 连接的运算符
     * @return {@link ResponseHeadersMatcher}
     */
    static headers = (rules: Record<string, HeaderValueMatchType>[], ops?: HttpMatchesOps): ResponseMatcher => {
        return ResponseMatcherFactory.build<Record<string, HeaderValueMatchType>>(ResponseHeadersMatcher, rules, ops)
    }

    /**
     * @param rules http status 匹配
     * @param ops  连接的运算符
     * @return {@link HttpStatusMatcher}
     */
    static status = (rules: Array<HttpStatusRangeMatchType>, ops?: HttpMatchesOps): ResponseMatcher => {
        return ResponseMatcherFactory.build<HttpStatusRangeMatchType>(HttpStatusMatcher, rules, ops)
    }

    /**
     * @return {@link RequestHeadersMatcher}
     */
    static ok = (): ResponseMatcher => {
        return new ResponseOkMatcher();
    }

    static medialType = (rules: Array<string>): ResponseMatcher => {
        const headerRules = rules.map(expect => {
            return {
                [HttpHeaderNames.contentType]: (actual: HttpMediaType | string) => matchMediaType(actual, expect)
            }
        });
        return ResponseMatcherFactory.headers(headerRules, HttpMatchesOps.OR);
    }

    static json = (): ResponseMatcher => {
        return ResponseMatcherFactory.medialType([HttpMediaType.APPLICATION_JSON_UTF8, HttpMediaType.TEXT_JSON_UTF8]);
    }


    private static build = <S>(matcherConstructor: { new(args: S): ResponseMatcher }, rules: Array<S>, ops?: HttpMatchesOps): ResponseMatcher => {
        return HttpMatcherFactory.buildMatcher<ReadyOnlyHttpResponse, S>(matcherConstructor, rules, ops)
    }
}