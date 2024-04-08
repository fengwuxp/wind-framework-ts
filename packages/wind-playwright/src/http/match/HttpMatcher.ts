import {ReadyOnlyHttpHeaders} from "../Http";


export type HeaderValueMatchType = (val: string) => boolean | string;


export interface HttpMatcher<R> {
    matches: (request: R) => boolean;
}

export enum HttpMatchesOps {

    OR="OR",

    AND="AND"
}

/**
 * 字符串匹配器
 * 如果 {@link #expect} 为 "*"，匹配任意字符串，否则必须完全匹配
 */
export class AnyTextMatcher implements HttpMatcher<string> {

    private readonly expect: string;

    private constructor(expectText: string) {
        this.expect = expectText;
    }

    static of = (text: string): AnyTextMatcher => {
        return new AnyTextMatcher(text);
    }

    matches = (text: string): boolean => {
        const {expect} = this;
        return expect === "*" || expect == text;
    }
}


/**
 * http headers 匹配器
 * 如果 {@link #expect} 为空，则总是匹配
 * 如果 {@link #expect} 的 value 类型为 {@link HeaderValueMatchType}，看函数返回值
 * @see AnyTextMatcher
 */
export class HttpHeadersMatcher implements HttpMatcher<ReadyOnlyHttpHeaders> {

    private readonly expect: Record<string, HeaderValueMatchType | string>;

    constructor(headers: Record<string, HeaderValueMatchType | string>) {
        this.expect = headers;
    }

    matches = (httpHeaders: ReadyOnlyHttpHeaders): boolean => {
        const {expect} = this;

        return Object.keys(expect).some(name => {
            const val = expect[name];
            if (val == null) {
                return true;
            }
            const headerValue = httpHeaders.get(name) ?? "";
            if (typeof val === "function") {
                return val(headerValue);
            }
            return AnyTextMatcher.of(val).matches(headerValue);
        });
    }
}

/**
 * 任意 {@link #delegates} 匹配即可
 */
class AnyMatchRequestMatcher<R> implements HttpMatcher<R> {

    private readonly delegates: HttpMatcher<R>[];

    constructor(delegates: HttpMatcher<R>[]) {
        this.delegates = delegates;
    }

    matches = (val: R): boolean => {
        return this.delegates.some((matcher) => {
            return matcher.matches(val);
        });
    }
}

/**
 * 所有 {@link #delegates} 都必须匹配
 */
class AllMatchRequestMatcher<R> implements HttpMatcher<R> {

    private readonly delegates: HttpMatcher<R>[];

    constructor(delegates: HttpMatcher<R>[]) {
        this.delegates = delegates;
    }

    matches = (val: R): boolean => {
        return this.delegates.map((matcher) => {
            return matcher.matches(val);
        }).reduce((prev, val) => prev && val);
    }
}

class AlwaysFalseRequestMatcher<R> implements HttpMatcher<R> {

    matches = (val: R): boolean => {
        return false;
    }
}

class AlwaysTrueRequestMatcher<R> implements HttpMatcher<R> {

    matches = (val: R): boolean => {
        return true;
    }
}


export class HttpMatcherFactory {

    static any = <R>(delegates: HttpMatcher<R>[]): HttpMatcher<R> => {
        return new AnyMatchRequestMatcher<R>(delegates);
    }

    static all = <R>(delegates: HttpMatcher<R>[]): HttpMatcher<R> => {
        return new AllMatchRequestMatcher<R>(delegates);
    }

    static alwaysFalse = <R>(): HttpMatcher<R> => {
        return new AlwaysFalseRequestMatcher();
    }

    static alwaysTrue = <R>(): HttpMatcher<R> => {
        return new AlwaysTrueRequestMatcher();
    }


    static ops = <R>(matchers: HttpMatcher<R>[], ops: HttpMatchesOps): HttpMatcher<R> => {
        return ops === HttpMatchesOps.OR ? HttpMatcherFactory.any(matchers) : HttpMatcherFactory.all(matchers);
    }

    static buildMatcher = <R, S>(matcherConstructor: { new(args: S): HttpMatcher<R> }, rules: Array<S>, ops: HttpMatchesOps = HttpMatchesOps.OR): HttpMatcher<R> => {
        if (!!rules) {
            return HttpMatcherFactory.ops(rules.map((rule) => new matcherConstructor(rule)), ops);
        }
        return HttpMatcherFactory.alwaysFalse();
    }
}