import {
    CONTENT_LENGTH_HEAD_NAME,
    CONTENT_TRANSFER_ENCODING_HEAD_NAME,
    CONTENT_TYPE_HEAD_NAME,
    HttpAdapter,
    HttpMediaType,
    HttpMethod,
    HttpRequestContextAttributes,
    HttpResponse,
    matchMediaType,
    responseIsFile,
    responseIsJson,
    responseIsText
} from "wind-http";
import fetch, {Request, RequestInfo, RequestInit, Response} from 'node-fetch';
import {NodeHttpRequest} from "./NodeHttpRequest";


// RequestInit prop names
const REQUEST_INIT_ATTRIBUTE_NAMES: string[] = [
    "referrer",
    "referrerPolicy",
    "mode",
    "credentials",
    "redirect",
    "cache",
    "integrity",
    "keepalive",
];


/**
 *  node http request adapter
 */
export default class NodeHttpAdapter implements HttpAdapter<NodeHttpRequest> {

    private readonly timeout: number;

    private readonly defaultOptions: RequestInit;

    private readonly consumes: HttpMediaType;

    /**
     * @param timeout  default 1min
     * @param defaultOptions
     * @param consumes  default 'application/json;charset=UTF-8'
     */
    constructor(timeout?: number, defaultOptions?: RequestInit, consumes?: HttpMediaType) {
        this.timeout = timeout ?? 60 * 1000;
        this.defaultOptions = defaultOptions ?? {};
        this.consumes = consumes;
    }

    send = (request: NodeHttpRequest, context: HttpRequestContextAttributes): Promise<HttpResponse> => {
        return new Promise<HttpResponse>((resolve, reject) => {
            const result = fetch(this.buildRequest(request)).then(this.convertResponse).catch((response: Response) => {
                const {headers, ok, status, statusText} = response;
                return Promise.reject({
                    data: response,
                    headers: (headers as any),
                    ok,
                    statusText,
                    statusCode: status,
                });
            });
            // 超时控制
            const timeId = setTimeout(() => {
                //丢弃请求
                console.log("browser fetch adapter request timeout", request);
                reject({
                    status: 502,
                    headers: null,
                    data: null,
                    ok: false,
                    statusText: `request timeout`
                });
            }, context.timeout || this.timeout);

            result.then(resolve)
                .catch(reject)
                .finally(() => {
                    //清除定时器
                    clearTimeout(timeId);
                });
        })
    };

    /**
     * build http request
     * @param  request
     * @return {Request}
     */
    private buildRequest(request: NodeHttpRequest): RequestInfo {
        const {
            url,
            method,
            headers,
            body
        } = request;

        if (headers != null && matchMediaType(headers[CONTENT_TYPE_HEAD_NAME] as HttpMediaType, HttpMediaType.MULTIPART_FORM_DATA)) {
            // remove content-type
            // @see {@link https://segmentfault.com/a/1190000010205162}
            delete headers[CONTENT_TYPE_HEAD_NAME];
        }
        const reqMethod = HttpMethod[method];
        // build RequestInit
        const requestInit: RequestInit = {
            ...this.defaultOptions,
            method: reqMethod,
            headers,
            body
        } as RequestInit;

        REQUEST_INIT_ATTRIBUTE_NAMES.forEach((name) => {
            const attr = request[name];
            if (attr == null) {
                return;
            }
            requestInit[name] = attr;
        });

        return new Request(url, requestInit);
    }

    private convertResponse = (resp: Response): Promise<HttpResponse> => {
        const {headers, ok, status, statusText} = resp;
        return this.parseResponse(resp).then(responeBody => {
            return {
                data: responeBody,
                headers: (headers as any),
                ok,
                statusText,
                statusCode: status,
            }
        })
    }

    /**
     * parse response data
     * @param response
     * @return {any}
     */
    private parseResponse = (response: Response): Promise<any> => {
        const {getHeaderByName, consumes} = this;
        const headers = response.headers;

        if (response.body == null) {
            // 没有响应 body 为null
            if (response.ok) {
                return Promise.resolve();
            }
        }

        // Transfer-Encoding：chunked 情况下没有Content-length请求头
        if (!this.hasTransferEncoding(headers)) {
            /**
             *  在跨域的情况下需要加以下响应的请求头到，不然无法读取到content length
             *  response.addHeader("Access-Control-Allow-Headers", "Content-Type,Content-Length");
             *  response.addHeader("Access-Control-Expose-Headers","Content-Type,Content-Length");
             */
            const contentLength = parseInt(getHeaderByName(headers, CONTENT_LENGTH_HEAD_NAME));
            // 降级模式
            const responseBodyIsEmpty = contentLength === 0; // || Object.is(contentLength, NaN);
            if (responseBodyIsEmpty) {
                return Promise.resolve();
            }
        }

        const responseMediaType: string = getHeaderByName(headers, CONTENT_TYPE_HEAD_NAME) || consumes;
        if (responseMediaType == null) {
            // 未知的 Content-Type  尝试做 json 解析
            return this.parseJSON(response)
                .catch(error => {
                    console.warn("Content-Type unknown,try parseJSON failure", error);
                    return Promise.resolve(response);
                })
        }
        const responseHeaders = {
            [CONTENT_TYPE_HEAD_NAME]: responseMediaType
        };

        if (responseIsJson(responseHeaders)) {
            return this.parseJSON(response);
        } else if (responseIsText(responseHeaders)) {
            return this.parseText(response);
        } else {
            if (responseIsFile({
                ...responseHeaders,
                [CONTENT_TRANSFER_ENCODING_HEAD_NAME]: getHeaderByName(headers, CONTENT_TRANSFER_ENCODING_HEAD_NAME)
            })) {
                return this.paresArrayBuffer(response);
            } else {
                return Promise.resolve(response)
            }

        }
    };

    private parseJSON = (response: Response): Promise<any> => {
        return response.json();
    }

    private parseText = (response: Response): Promise<string> => {
        return response.text();
    }

    private paresArrayBuffer = (response: Response): Promise<ArrayBuffer> => {
        return response.arrayBuffer();
    }

    private getHeaderByName = (headers: Headers, name: string) => {
        return headers.get(name) || headers.get(name.toLowerCase());
    };

    /**
     * http Transfer-Encoding
     * @param headers
     */
    private hasTransferEncoding = (headers: Headers) => {
        const name = 'Transfer-Encoding';
        const value = headers.get(name) || headers.get(name.toLowerCase());
        return value === "chunked";
    }
}

