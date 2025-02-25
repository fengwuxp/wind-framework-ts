import AntPathMatcher from '@howiefh/ant-path-matcher';
import {HttpMethod} from "../enums/HttpMethod";
import {HttpRequest} from "../Http";
import {PathMatcher} from "wind-common-utils/lib/match/PathMatcher";

interface HttpHeader {
    name: string;
    value: string
}

/**
 * use match interceptor is executed before the request
 */
export abstract class MappedInterceptor {

    protected includePatterns: string[];

    protected excludePatterns: string[];

    protected includeMethods: HttpMethod[];

    protected excludeMethods: HttpMethod[];

    protected includeHeaders: HttpHeader[];

    protected excludeHeaders: HttpHeader[];

    protected pathMatcher: PathMatcher = new AntPathMatcher();


    constructor(includePatterns: string[],
                excludePatterns: string[],
                includeMethods: HttpMethod[],
                excludeMethods: HttpMethod[],
                includeHeaders?: string[][],
                excludeHeaders?: string[][],) {
        this.includePatterns = includePatterns;
        this.excludePatterns = excludePatterns;
        this.includeMethods = includeMethods;
        this.excludeMethods = excludeMethods;
        this.includeHeaders = this.converterHeaders(includeHeaders);
        this.excludeHeaders = this.converterHeaders(excludeHeaders);
    }


    /**
     * Determine a match for the given lookup path.
     * @param request
     * @return {@code true} if the interceptor applies to the given request path or http methods or http headers
     */
    public matches = (request: HttpRequest): boolean => {
        const sources = [request.url, request.method, request.headers];
        // find first not match ,if not found, default return true
        const isNotMatch = ["Url", "Method", "Headers"].some((methodName, index) => {
            return this[`matches${methodName}`](sources[index]) === false;
        });
        return !isNotMatch;
    };

    /**
     * Determine a match for the given lookup path.
     * @param lookupPath the current request path
     * @param pathMatcher a path matcher for path pattern matching
     * @return {@code true} if the interceptor applies to the given request path
     */
    public matchesUrl = (lookupPath: string, pathMatcher?: PathMatcher): boolean => {
        const pathMatcherToUse = pathMatcher || this.pathMatcher;
        const {excludePatterns, includePatterns} = this;
        return this.doMatch(lookupPath.split("?")[0], includePatterns, excludePatterns, (pattern: string, path: string) => {
            return pathMatcherToUse.match(pattern, path);
        })
    };

    /**
     * Determine a match for the given http method
     * @param method
     */
    public matchesMethod = (method: HttpMethod): boolean => {
        const {includeMethods, excludeMethods} = this;
        return this.doMatch(method, includeMethods, excludeMethods, (pattern: HttpMethod, matchSource: HttpMethod) => {
            return pattern === matchSource;
        })
    };

    /**
     * Determine a match for the given request headers
     * @param headers
     */
    public matchesHeaders = (headers: Record<string, string>): boolean => {
        if (headers == null) {
            return true;
        }
        return this.doMatch(headers, this.includeHeaders, this.excludeHeaders, (pattern: HttpHeader, matchSource: Record<string, string>) => {

            const {name, value} = pattern;
            const needMatchValue = value != null;
            const headerValue = matchSource[name];
            if (needMatchValue) {
                return headerValue === value;
            }
            return headerValue != null;
        })
    };


    /**
     *
     * @param matchSource  use match source
     * @param includes
     * @param excludes
     * @param predicate
     */
    private doMatch = (matchSource, includes: any[], excludes: any[], predicate: (pattern, matchSource) => boolean) => {
        if (excludes != null) {
            const isMatch = excludes.some((pattern) => predicate(pattern, matchSource));
            if (isMatch) {
                return false;
            }
        }
        if (includes == null || includes.length === 0) {
            return true
        }
        return includes.some((pattern) => predicate(pattern, matchSource));


    };

    private converterHeaders = (headers: string[][]) => {
        if (headers == null) {
            return null;
        }

        return headers.map((items) => {
            return {
                name: items[0],
                value: items[1],
            }
        })
    }
}
