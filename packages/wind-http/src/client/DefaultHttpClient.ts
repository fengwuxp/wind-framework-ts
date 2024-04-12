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

    // 已执行拦截器的索引位置
    private pos: number = 0;

    constructor(httpAdapter: HttpAdapter, interceptors?: ClientHttpRequestInterceptor[]) {
        this.httpAdapter = httpAdapter;
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
                const contentType = request.headers[CONTENT_TYPE_HEAD_NAME];
                request.body = serializeRequestBody(request.body, contentType, false);
            }
            // send request
            return this.httpAdapter.send(request, context);
        }
    }

}

/**
 * default http client
 * Provides support for common HTTP method requests
 * Retry if needed {@see RetryHttpClient}
 */
export default class DefaultHttpClient<T extends HttpRequest = HttpRequest> extends AbstractHttpClient<T> {

    private static LOG = DefaultHttpLo4jFactory.getLogger(DefaultHttpClient.name);

    private readonly httpAdapter: HttpAdapter;

    private readonly interceptors?: ClientHttpRequestInterceptor[];

    private readonly defaultProduce: HttpMediaType;

    /**
     * In order to support different js runtime environments, the following parameters need to be provided
     * @param httpAdapter     Request adapters for different platforms
     * @param interceptors    Intercept the given request, and return a response
     * @param defaultProduce  default request Body Content-Type
     */
    constructor(httpAdapter: HttpAdapter, interceptors?: ClientHttpRequestInterceptor[], defaultProduce: HttpMediaType = HttpMediaType.APPLICATION_JSON) {
        super();
        this.httpAdapter =httpAdapter;
        this.interceptors =interceptors;
        this.defaultProduce = defaultProduce;
    }

    /**
     * send a http request to a remote server
     * @param request
     * @param context
     */
    send = (request: T, context: HttpRequestContextAttributes = {}): Promise<HttpResponse> => {
        if (request.headers == null) {
            request.headers = {};
        }
        if (supportRequestBody(request.method) && request.headers[CONTENT_TYPE_HEAD_NAME] == null) {
            // fill default content type
            request.headers[CONTENT_TYPE_HEAD_NAME] = this.defaultProduce;
        }
        if (DefaultHttpClient.LOG.isDebugEnabled()) {
            DefaultHttpClient.LOG.debug("send http request, request = {}, context = {}", request, context);
        }
        return new InterceptingRequestExecution(this.httpAdapter, this.interceptors).execute(request, context);
    }

}
