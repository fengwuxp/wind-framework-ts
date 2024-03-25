import {HttpAdapter, HttpRequest, HttpRequestContextAttributes, HttpResponse} from "../Http";
import {ClientHttpRequestInterceptor} from "./ClientHttpRequestInterceptor";
import MappedClientHttpRequestInterceptor from "../interceptor/MappedClientHttpRequestInterceptor";
import {convertClientHttpRequestInterceptor} from "../utils/ConvertFunctionInterface";
import {serializeRequestBody, supportRequestBody} from "../utils/SerializeRequestBodyUtil";
import {CONTENT_TYPE_HEAD_NAME} from "../HttpConstants";
import {AbstractHttpClient} from "./AbstractHttpClient";
import {DefaultHttpLo4jFactory} from "../log/HttpLog4jFactory";
import {HttpMediaType} from "wind-common-utils/lib/http/HttpMediaType";

class InterceptingRequestExecution {

    private readonly httpAdapter: HttpAdapter;

    private readonly interceptors: ClientHttpRequestInterceptor[];

    private readonly defaultProduce: HttpMediaType;

    // 已执行拦截器的索引位置
    private pos: number = 0;

    constructor(httpAdapter: HttpAdapter, interceptors?: ClientHttpRequestInterceptor[], defaultProduce?: HttpMediaType) {
        this.httpAdapter = httpAdapter;
        this.defaultProduce = defaultProduce;
        this.interceptors = interceptors || [];
    }

    execute = (request: HttpRequest, context: HttpRequestContextAttributes) => {
        const {httpAdapter, interceptors, pos} = this;
        if (pos < interceptors.length) {
            const interceptor = interceptors[pos];
            this.pos++;
            if (interceptor instanceof MappedClientHttpRequestInterceptor) {
                if (interceptor.matches(request)) {
                    return convertClientHttpRequestInterceptor(interceptor).intercept(request, context, this.execute);
                } else {
                    return this.execute(request, context);
                }
            } else {
                return convertClientHttpRequestInterceptor(interceptor).intercept(request, context, this.execute);
            }
        } else {
            if (supportRequestBody(request.method)) {
                const contentType = this.resolveContentType(request);
                request.body = serializeRequestBody(request.body, contentType, false);
            }
            // send request
            return this.httpAdapter.send(request, context);
        }
    }

    private resolveContentType = (request: HttpRequest): HttpMediaType => {
        let headers = request.headers;
        let contentType = this.defaultProduce;
        if (headers == null) {
            headers = {};
            request.headers = headers;
        } else {
            contentType = headers[CONTENT_TYPE_HEAD_NAME] as HttpMediaType || contentType;
        }
        headers[CONTENT_TYPE_HEAD_NAME] = contentType;
        return contentType;
    }

}

/**
 * default http client
 * Provides support for common HTTP method requests
 * Retry if needed {@see RetryHttpClient}
 */
export default class DefaultHttpClient<T extends HttpRequest = HttpRequest> extends AbstractHttpClient<T> {

    private static LOG = DefaultHttpLo4jFactory.getLogger(DefaultHttpClient.name);

    private readonly requestExecution: InterceptingRequestExecution;

    /**
     * In order to support different js runtime environments, the following parameters need to be provided
     * @param httpAdapter           Request adapters for different platforms
     * @param interceptors
     * @param defaultProduce
     */
    constructor(httpAdapter: HttpAdapter, interceptors?: ClientHttpRequestInterceptor[], defaultProduce?: HttpMediaType) {
        super();
        this.requestExecution = new InterceptingRequestExecution(httpAdapter, interceptors, defaultProduce);
    }

    /**
     * send a http request to a remote server
     * @param request
     * @param context
     */
    send = (request: T, context: HttpRequestContextAttributes = {}): Promise<HttpResponse> => {
        if (DefaultHttpClient.LOG.isDebugEnabled()) {
            DefaultHttpClient.LOG.debug("send http request, request = {}, context = {}", request, context);
        }
        if (request.headers == null) {
            request.headers = {};
        }
        return this.requestExecution.execute(request, context);
    }

}
