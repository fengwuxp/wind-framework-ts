import {HttpHeaderNames, ReadyOnlyHttpRequest, ReadyOnlyHttpResponse} from "./Http";
import {AntRequestMatcher, QueryParamMathType, RequestMatcher, RequestMatcherFactory} from "./match/RequestMatcher";
import {HeaderValueMatchType, HttpMatcherFactory, HttpMatchesOps} from "./match/HttpMatcher";
import EventEmitter from "eventemitter3"
import {HttpMethod, responseIsJson, responseIsText} from "wind-http";
import {Page, Response} from "playwright";
import {ResponseMatcherFactory} from "./match/ResponseMatcher";
import {NativeReadyOnlyHttpRequest, NativeReadyOnlyHttpResponse} from "./HttpObject";
import {BrowserNetworkMonitor} from "../network/BrowserNetworkMonitor";

type HttpReadOnlyEvent = {
    request: ReadyOnlyHttpRequest;
    response: ReadyOnlyHttpResponse;
}

export type PlaywrightHttpResponse<T> = Promise<ReadyOnlyHttpResponse<T>>

type MatcherManager = {
    add: (matcher: RequestMatcher) => void;
    remove: (matcher: RequestMatcher) => void;
}

class HttpEventListenerBuilder {

    private left: RequestMatcher;

    private ops: HttpMatchesOps = HttpMatchesOps.AND;

    private readonly requestPattern: string;

    private readonly emitter: EventEmitter;

    private readonly matcherManager: MatcherManager

    constructor(requestPattern: string, emitter: EventEmitter, matcherManager: MatcherManager) {
        this.requestPattern = requestPattern;
        this.emitter = emitter;
        this.left = HttpMatcherFactory.alwaysTrue();
        this.matcherManager = matcherManager;
    }

    public referer = (refer: string): HttpEventListenerBuilder => {
        this.combineRequestMatcher(RequestMatcherFactory.referer([refer]));
        return this;
    }

    public headers = (headers: Record<string, HeaderValueMatchType>): HttpEventListenerBuilder => {
        this.combineRequestMatcher(RequestMatcherFactory.headers([headers]));
        return this;
    }

    public queryPrams = (queryParams: QueryParamMathType): HttpEventListenerBuilder => {
        this.combineRequestMatcher(RequestMatcherFactory.queryPrams([queryParams]));
        return this;
    }

    public or = (): HttpEventListenerBuilder => {
        this.ops = HttpMatchesOps.OR;
        return this;
    }

    private combineRequestMatcher = (right: RequestMatcher) => {
        this.left = HttpMatcherFactory.ops([this.left, right], this.ops);
        this.ops = HttpMatchesOps.AND;
    }

    public once = (func: (event: HttpReadOnlyEvent) => void) => {
        return this.listen("once", func);
    }

    public on = (func: (event: HttpReadOnlyEvent) => void) => {
        return this.listen("on", func);
    }

    private listen = (method: "once" | "on", func: (event: HttpReadOnlyEvent) => void) => {
        const {emitter, requestPattern, matcherManager, left} = this;
        matcherManager.add(left);
        if (method === "once") {
            let original = func;
            func = (data) => {
                matcherManager.remove(left);
                original(data);
            }
        }
        emitter[method](requestPattern, func);
        return () => {
            matcherManager.remove(left);
            emitter.removeListener(requestPattern, func);
        }
    }
}


/**
 * http 请求监听器
 */
export default class HttpMonitor implements BrowserNetworkMonitor {

    readonly page: Page;

    private readonly httpMatcherHolder: HttpMatcherHolder

    private readonly emitter: EventEmitter = new EventEmitter();

    private readonly requestMatchers: Record<string, RequestMatcher[]> = {};

    private constructor(page: Page) {
        this.page = page;
        this.httpMatcherHolder = new HttpMatcherHolder(this.emitter);
    }

    public static of = (page: Page) => {
        return new HttpMonitor(page)
    }

    start = async () => {
        const {page, httpMatcherHolder, emitter, requestMatchers} = this;
        interceptHttpJsonResponse(page, httpMatcherHolder, (patterns, data) => {
            for (const pattern of patterns) {
                const matchers = requestMatchers[pattern];
                if (matchers == null || HttpMatcherFactory.ops(matchers, HttpMatchesOps.OR).matches(data.request)) {
                    emitter.emit(pattern, data);
                }
            }
        });
    }

    destroy = async (): Promise<void> => {
        const {page, emitter} = this;
        await page.unroute("**");
        emitter.removeAllListeners();
    }


    /**
     * 等待接口 2xx 响应
     * @param url
     * @param method
     * @param before
     */
    wait2xx = async (url: string, method: HttpMethod, before?: (page: Page) => Promise<void>): Promise<HttpReadOnlyEvent> => {
        const result = new Promise<HttpReadOnlyEvent>((resolve, reject) => {
            this.request(url, method).once((event) => {
                if (event.response.ok) {
                    resolve(event)
                } else {
                    reject(event);
                }
            });
        });
        if (typeof before === "function") {
            await before(this.page);
        }
        return result;
    }

    /**
     * 等待接口 2xx 响应
     * @param url
     * @param method
     * @param before
     */
    wait2xxResponse = async <T>(url: string, method: HttpMethod, before?: (page: Page) => Promise<void>): Promise<ReadyOnlyHttpResponse<T>> => {
        const result = new Promise<ReadyOnlyHttpResponse<T>>((resolve, reject) => {
            this.request(url, method).once((event) => {
                if (event.response.ok) {
                    resolve(event.response)
                } else {
                    reject(event);
                }
            });
        });
        if (typeof before === "function") {
            await before(this.page);
        }
        return result;
    }


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
    request = (url: string, method?: HttpMethod): HttpEventListenerBuilder => {
        const {requestMatchers} = this
        const requestPattern = method == null ? url : `${method} ${url}`;
        return new HttpEventListenerBuilder(requestPattern, this.emitter, {
            add: (matcher) => {
                const values = requestMatchers[requestPattern] ?? [];
                values.push(matcher);
                requestMatchers[requestPattern] = values;
            },
            remove: (matcher) => {
                const values = requestMatchers[requestPattern] ?? [];
                requestMatchers[requestPattern] = values.filter(value => value !== matcher);
            }
        })
    }

    /**
     * @param requestPattern
     */
    removeAllListeners = (requestPattern: string) => {
        this.emitter.removeAllListeners(requestPattern);
        return this
    }
}


const readHttpResponse = (response: Response) => {
    if (responseIsJson(response.headers())) {
        return response.json();
    }
    if (responseIsText(response.headers())) {
        return response.text();
    }
    const medialType = response.headers()[HttpHeaderNames.contentType];
    // TODO fallback ?
    return Promise.reject(`unsupported medial type = ${medialType}`)
}


class HttpMatcherHolder {

    private readonly emitter: EventEmitter;

    readonly responseMatcher = ResponseMatcherFactory.json();

    constructor(emitter: EventEmitter) {
        this.emitter = emitter;
    }

    matches = (request: ReadyOnlyHttpRequest): string[] => {
        return this.emitter.eventNames()
            .map(name => name.toString())
            .filter(pattern => {
                const matcher = new AntRequestMatcher(pattern);
                return matcher.matches(request);
            });
    }
}


const interceptHttpJsonResponse = (page: Page, holder: HttpMatcherHolder, handle: (patterns: string[], event: HttpReadOnlyEvent) => void) => {
    page.on('requestfinished', async (request) => {
        const httpRequest = new NativeReadyOnlyHttpRequest(request);
        const requestPatterns = holder.matches(httpRequest);
        if (requestPatterns.length == 0) {
            // 不需要拦截
            return;
        }
        request.response().then((response) => {
            if (response == null) {
                return
            }
            const httpResponse = new NativeReadyOnlyHttpResponse(response);
            if (holder.responseMatcher.matches(httpResponse)) {
                readHttpResponse(response).then((body) => {
                    httpResponse.setBody(body);
                    handle(requestPatterns, {
                        request: httpRequest,
                        response: httpResponse
                    });
                }).catch((error: Error) => {
                    // 完整的错误消息： response.json: Protocol error (Network.getResponseBody): No resource with given identifier found
                    if (!!error.message && error.message.includes('No resource with given identifier found')) {
                        // 忽略由于页面刷新，导致接口数据获取失败的错误
                        console.warn(`monitor url = ${request.url()} 接口响应失败，由于是页面刷新导致，忽略该异常：${error.message}`);
                        return;
                    }
                    console.error(`monitor url = ${request.url()} 接口响应失败， error `, error);
                });
            }
        })
    })
}


