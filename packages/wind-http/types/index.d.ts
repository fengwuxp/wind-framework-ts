import { HttpMediaType } from 'wind-common-utils/lib/http/HttpMediaType';
export { HttpMediaType, matchMediaType } from 'wind-common-utils/lib/http/HttpMediaType';
import { DateFormatType } from 'wind-common-utils/lib/date/DateFormatUtils';
import { ApiRequestSinger } from 'wind-api-signature';
import { PathMatcher } from 'wind-common-utils/lib/match/PathMatcher';
import { ParsedUrlQueryInput } from 'querystring';

/**
 * http request method
 */
declare enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
    HEAD = "HEAD",
    TRACE = "TRACE",
    OPTIONS = "OPTIONS"
}

type SupportSerializableBody = Record<string, any> | Array<any> | string | undefined;
/**
 * uri path variable
 * example url: "http://a.b.com/{module}/{id}", ["member",1]  ==> "http://a.b.com/member/1"
 */
type UriPathVariable = Array<boolean | string | number | Date>;
/**
 * query params type
 */
type QueryParamType = Record<string, boolean | number | string | Date | UriPathVariable>;
/**
 * uri variable type
 * example url: "http://a.b.com/",{module:"member",id:1}  ==> "http://a.b.com/?module=member&id=1"
 */
type UriVariable = UriPathVariable | QueryParamType;
/**
 * The payload object used to make the HTTP request
 * {@see HttpAdapter}
 * {@see HttpClient}
 */
interface HttpRequest {
    /**
     * http request method
     * {@see HttpMethod}
     */
    method: HttpMethod;
    /**
     * 请求 url，包含查询参数
     */
    url: string;
    /**
     * request body
     */
    body?: SupportSerializableBody;
    /**
     * request headers
     */
    headers?: HeadersInit;
}
/**
 * http retry options
 * {@see RetryHttpClient}
 */
interface HttpRetryOptions {
    /**
     * number of retries
     * default：1
     */
    retries?: number;
    /**
     * how long after the request fails, retry, in milliseconds
     * default：100 ms
     */
    delay?: number;
    /**
     * max timeout times
     * default：25 * 1000 ms
     */
    maxTimeout?: number;
    /**
     * do you need to continue to try again
     * @param response
     */
    when?: (response: HttpResponse) => boolean;
    /**
     * custom retry processing
     * @param request  request data
     * @param response response data
     */
    onRetry?(request: HttpRequest, response: HttpResponse): Promise<HttpResponse>;
}
/**
 * The http request context
 */
interface HttpRequestContextAttributes extends Record<string, any> {
    /**
     * request time out times
     * The default value needs to be provided by the implementation class that implements the HttpAdapter interface
     * {@see HttpAdapter}
     */
    timeout?: number;
    /**
     * retry options
     */
    retryOptions?: HttpRetryOptions;
    /**
     * required to show progress bar
     */
    showProcessBar?: boolean;
}
/**
 * http request response
 *
 * Unified http response. Implementations of different platforms need to return instances of the object or subclasses of the object.
 * {@see HttpAdapter}
 */
interface HttpResponse<T = any> {
    /**
     * http status code
     */
    statusCode: number;
    /**
     * http status text
     */
    statusText?: string;
    /**
     * request is success
     */
    ok: boolean;
    /**
     * response data
     */
    data: T;
    /**
     * http response headers
     */
    headers?: Record<string, string>;
}
/**
 * http request adapter
 *
 * different http clients can be implemented according to different java script runtime environments.
 *
 * {@param T} T extends {@see HttpRequest} Implementers can expand according to different situations
 * {@see HttpResponse}
 */
interface HttpAdapter<T extends HttpRequest = HttpRequest> {
    /**
     * send a http request to a remote server
     * @param request http request
     * @param context request context
     */
    send: (request: T, context: HttpRequestContextAttributes) => Promise<HttpResponse>;
}

/**
 *  * Enumeration of HTTP status codes.
 */
declare enum HttpStatus {
    /**
     * {@code 100 Continue}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.2.1">HTTP/1.1: Semantics and Content, section 6.2.1</a>
     */
    /**
     * {@code 200 OK}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.3.1">HTTP/1.1: Semantics and Content, section 6.3.1</a>
     */
    OK = 200,
    /**
     * {@code 201 Created}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.3.2">HTTP/1.1: Semantics and Content, section 6.3.2</a>
     */
    CREATED = 201,
    /**
     * {@code 202 Accepted}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.3.3">HTTP/1.1: Semantics and Content, section 6.3.3</a>
     */
    ACCEPTED = 202,
    /**
     * {@code 203 Non-Authoritative Information}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.3.4">HTTP/1.1: Semantics and Content, section 6.3.4</a>
     */
    NON_AUTHORITATIVE_INFORMATION = 203,
    /**
     * {@code 204 No Content}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.3.5">HTTP/1.1: Semantics and Content, section 6.3.5</a>
     */
    NO_CONTENT = 204,
    /**
     * {@code 205 Reset Content}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.3.6">HTTP/1.1: Semantics and Content, section 6.3.6</a>
     */
    RESET_CONTENT = 205,
    /**
     * {@code 206 Partial Content}.
     * @see <a href="https://tools.ietf.org/html/rfc7233#section-4.1">HTTP/1.1: Range Requests, section 4.1</a>
     */
    PARTIAL_CONTENT = 206,
    /**
     * {@code 207 Multi-Status}.
     * @see <a href="https://tools.ietf.org/html/rfc4918#section-13">WebDAV</a>
     */
    /**
     * {@code 302 Found}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.4.3">HTTP/1.1: Semantics and Content, section 6.4.3</a>
     */
    FOUND = 302,
    /**
     * {@code 400 Bad Request}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.1">HTTP/1.1: Semantics and Content, section 6.5.1</a>
     */
    BAD_REQUEST = 400,
    /**
     * {@code 401 Unauthorized}.
     * @see <a href="https://tools.ietf.org/html/rfc7235#section-3.1">HTTP/1.1: Authentication, section 3.1</a>
     */
    UNAUTHORIZED = 401,
    /**
     * {@code 402 Payment Required}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.2">HTTP/1.1: Semantics and Content, section 6.5.2</a>
     */
    PAYMENT_REQUIRED = 402,
    /**
     * {@code 403 Forbidden}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.3">HTTP/1.1: Semantics and Content, section 6.5.3</a>
     */
    FORBIDDEN = 403,
    /**
     * {@code 404 Not Found}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.4">HTTP/1.1: Semantics and Content, section 6.5.4</a>
     */
    NOT_FOUND = 404,
    /**
     * {@code 405 Method Not Allowed}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.5">HTTP/1.1: Semantics and Content, section 6.5.5</a>
     */
    METHOD_NOT_ALLOWED = 405,
    /**
     * {@code 406 Not Acceptable}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.6">HTTP/1.1: Semantics and Content, section 6.5.6</a>
     */
    /**
     * {@code 500 Internal Server Error}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.6.1">HTTP/1.1: Semantics and Content, section 6.6.1</a>
     */
    INTERNAL_SERVER_ERROR = 500,
    /**
     * {@code 501 Not Implemented}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.6.2">HTTP/1.1: Semantics and Content, section 6.6.2</a>
     */
    NOT_IMPLEMENTED = 501,
    /**
     * {@code 502 Bad Gateway}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.6.3">HTTP/1.1: Semantics and Content, section 6.6.3</a>
     */
    BAD_GATEWAY = 502,
    /**
     * {@code 503 Service Unavailable}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.6.4">HTTP/1.1: Semantics and Content, section 6.6.4</a>
     */
    SERVICE_UNAVAILABLE = 503,
    /**
     * {@code 504 Gateway Timeout}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.6.5">HTTP/1.1: Semantics and Content, section 6.6.5</a>
     */
    GATEWAY_TIMEOUT = 504,
    /**
     * {@code 505 HTTP Version Not Supported}.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.6.6">HTTP/1.1: Semantics and Content, section 6.6.6</a>
     */
    HTTP_VERSION_NOT_SUPPORTED = 505
}

/**
 * http header content type name
 */
declare const CONTENT_TYPE_HEAD_NAME = "Content-Type";
/**
 * http header content length name
 */
declare const CONTENT_LENGTH_HEAD_NAME = "Content-Length";
/**
 * http header content transfer encoding name
 */
declare const CONTENT_TRANSFER_ENCODING_HEAD_NAME = "Content-Transfer-Encoding";
/**
 * default api service name
 */
declare const DEFAULT_SERVICE_NAME = "default";
declare const LB_SCHEMA = "lb://";
declare const HTTP_SCHEMA = "http://";
declare const HTTPS_SCHEMA = "https://";
/**
 * mock unauthorized response
 */
declare const UNAUTHORIZED_RESPONSE: {
    ok: boolean;
    statusCode: HttpStatus;
    statusText: string;
};

/**
 * http request client
 * Provides basic http request capabilities
 * Extend from {@see HttpAdapter }
 */
interface HttpClient<T extends HttpRequest = HttpRequest> extends HttpAdapter<T> {
    /**
     *  get request
     * @param url
     * @param context
     * @param headers
     */
    get: (url: string, context?: HttpRequestContextAttributes, headers?: HeadersInit) => Promise<HttpResponse>;
    /**
     *  delete request
     * @param url
     * @param context
     * @param headers
     */
    delete: (url: string, context?: HttpRequestContextAttributes, headers?: HeadersInit) => Promise<HttpResponse>;
    /**
     *  delete request
     * @param url
     * @param context
     * @param headers
     */
    head: (url: string, context?: HttpRequestContextAttributes, headers?: HeadersInit) => Promise<HttpResponse>;
    /**
     * post request
     * @param url
     * @param body  serialize the body to a string based on the `Content-Type` type in the request header
     * @param context
     * @param headers
     */
    post: (url: string, body: SupportSerializableBody, context?: HttpRequestContextAttributes, headers?: HeadersInit) => Promise<HttpResponse>;
    /**
     * put request
     * @param url
     * @param body  serialize the body to a string based on the `Content-Type` type in the request header
     * @param context
     * @param headers
     */
    put: (url: string, body: SupportSerializableBody, context?: HttpRequestContextAttributes, headers?: HeadersInit) => Promise<HttpResponse>;
    /**
     * put request
     * @param url
     * @param body  serialize the body to a string based on the `Content-Type` type in the request header
     * @param context
     * @param headers
     */
    patch: (url: string, body: SupportSerializableBody, context?: HttpRequestContextAttributes, headers?: HeadersInit) => Promise<HttpResponse>;
}

/**
 * abstract http client
 * Request header with 'Content-Type' as 'application/x-www-form-urlencoded' is provided by default
 */
declare abstract class AbstractHttpClient<T extends HttpRequest = HttpRequest> implements HttpClient<T> {
    delete: (url: string, context?: HttpRequestContextAttributes, headers?: HeadersInit) => Promise<HttpResponse>;
    get: (url: string, context?: HttpRequestContextAttributes, headers?: HeadersInit) => Promise<HttpResponse>;
    head: (url: string, context?: HttpRequestContextAttributes, headers?: HeadersInit) => Promise<HttpResponse>;
    patch: (url: string, body: SupportSerializableBody, context?: HttpRequestContextAttributes, headers?: HeadersInit) => Promise<HttpResponse>;
    post: (url: string, body: SupportSerializableBody, context?: HttpRequestContextAttributes, headers?: HeadersInit) => Promise<HttpResponse>;
    put: (url: string, body: SupportSerializableBody, context?: HttpRequestContextAttributes, headers?: HeadersInit) => Promise<HttpResponse>;
    /**
     * send a http request to a remote server
     * @param request
     * @param context
     */
    abstract send: (request: T, context?: HttpRequestContextAttributes) => Promise<HttpResponse>;
}

/**
 * authentication strategy
 */
interface AuthenticationStrategy<T extends HttpRequest> {
    authentication: (request: T) => Promise<T>;
}
interface AuthenticationToken {
    /**
     * authorization info
     */
    authorization: string;
    /**
     * token 到期时间，单位：毫秒数
     */
    expireTime: number;
    /**
     * refresh token
     */
    refreshToken?: string;
    /**
     * refresh 到期时间，单位：毫秒数
     * {@see NEVER_REFRESH_TIME}
     */
    refreshExpireTime?: number;
}

/**
 * Represents the context of a client-side HTTP request execution.
 *
 * Used to invoke the next interceptor in the interceptor chain,
 * or - if the calling interceptor is last - execute the request itself.
 *
 * Execute the request with the given request attributes and body,and return the response.
 * @param request The request to be executed.
 * @param context The context of the request
 */
type ClientHttpRequestExecution<T extends HttpRequest = HttpRequest, R = any> = (request: T, context: HttpRequestContextAttributes) => Promise<R>;
/**
 *  Intercept the given request, and return a response
 *
 *  @param reqest The request to be intercepted
 *  @param context The context of the request
 *  @return promise request response object
 */
type ClientHttpRequestInterceptorFunction<T extends HttpRequest = HttpRequest, R = any> = (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T, R>) => Promise<R>;
/**
 * Intercepts client-side HTTP requests.
 * Only executed in http client
 * {@see HttpClient#send}
 * {@see DefaultHttpClient#send}
 */
interface ClientHttpRequestInterceptorInterface<T extends HttpRequest = HttpRequest, R = any> {
    /**
     * Intercept before http request, you can change the requested information
     */
    intercept: ClientHttpRequestInterceptorFunction<T, R>;
}
/**
 * Throw an exception or Promise#reject will interrupt the request
 */
type ClientHttpRequestInterceptor<T extends HttpRequest = HttpRequest> = ClientHttpRequestInterceptorFunction<T> | ClientHttpRequestInterceptorInterface<T>;

/**
 * default http client
 * Provides support for common HTTP method requests
 * Retry if needed {@see RetryHttpClient}
 */
declare class DefaultHttpClient<T extends HttpRequest = HttpRequest> extends AbstractHttpClient<T> {
    private static LOG;
    private readonly httpAdapter;
    private readonly interceptors?;
    private readonly defaultProduce;
    /**
     * In order to support different js runtime environments, the following parameters need to be provided
     * @param httpAdapter     Request adapters for different platforms
     * @param interceptors    Intercept the given request, and return a response
     * @param defaultProduce  default request Body Content-Type
     */
    constructor(httpAdapter: HttpAdapter, interceptors?: ClientHttpRequestInterceptor[], defaultProduce?: HttpMediaType);
    /**
     * send a http request to a remote server
     * @param request
     * @param context
     */
    send: (request: T, context?: HttpRequestContextAttributes) => Promise<HttpResponse>;
}

interface RefreshTokenAuthenticationOptions {
    /**
     * 获取 token
     * @param request
     */
    getToken: (request: Readonly<HttpRequest>) => Promise<AuthenticationToken>;
    /**
     * 刷新 token
     * @param request
     */
    refreshToken: (token: AuthenticationToken, request: Readonly<HttpRequest>) => Promise<AuthenticationToken>;
    /**
     * 添加 authorization header
     * @param authorization
     * @param request
     */
    appendAuthorizationHeader?: (authorization: AuthenticationToken, request: HttpRequest) => HttpRequest;
    /**
     * Synchronous blocking 'authorization' refresh
     * default: true
     */
    synchronousRefreshAuthorization?: boolean;
    /**
     * Refresh tokens 5 minutes in advance by default
     * default: 5min
     */
    aheadOfTimes?: number;
}
/**
 * Refresh token authentication strategy
 */
declare class RefreshTokenAuthenticationStrategy implements AuthenticationStrategy<HttpRequest> {
    private readonly options;
    private waitRequestQueue;
    private refreshing;
    constructor(options: RefreshTokenAuthenticationOptions);
    authentication: (request: HttpRequest) => Promise<HttpRequest>;
    private refreshToken;
    private syncRefreshToken;
    private completeWaitQueue;
    private refreshToken0;
}

/**
 * support retry http client
 * HttpClient with retry, need to be recreated each time you use this client
 */
declare class RetryHttpClient<T extends HttpRequest = HttpRequest> extends AbstractHttpClient<T> {
    private static LOG;
    private readonly httpClient;
    private readonly retryOptions;
    private countRetry;
    private retryEnd;
    constructor(httpClient: HttpClient<T>, retryOptions: HttpRetryOptions);
    send: (request: T, context?: HttpRequestContextAttributes) => Promise<HttpResponse>;
    /**
     * try retry request
     * @param request
     * @param response
     */
    private tryRetry;
    /**
     * default retry handle
     * @param req
     * @param response
     */
    private onRetry;
    /**
     * whether to retry
     * @param response
     */
    private whenRetry;
}

/**
 * routing url
 * @param url  example: @default/api/xxx
 */
declare const getRealRequestUrl: (url: string) => string;
/**
 * 添加路由配置
 * @param routeMapping
 */
declare const appendRouteMapping: (routeMapping: Record<string, string>) => void;

type DateConverter = (date: Date) => number | string;
declare const timeStampDateConverter: DateConverter;
declare const stringDateConverter: (fmt?: DateFormatType) => DateConverter;

/**
 * Generic callback interface used by {@link RestTemplate}'s retrieval methods
 * Implementations of this interface perform the actual work of extracting data
 * from a {@link HttpResponse}, but don't need to worry about exception
 * handling or closing resources.
 *
 * <p>Used internally by the {@link RestTemplate}, but also useful for application code.
 *
 */
interface ResponseExtractorInterface<T = any> {
    extractData: ResponseExtractorFunction<T>;
}
/**
 * Extract data from the given {@code HttpResponse} and return it.
 * @param response the HTTP response
 * @return the extracted data
 */
type ResponseExtractorFunction<T = any> = (response: HttpResponse, businessAssert?: BusinessResponseExtractorFunction) => T | Promise<T> | null | undefined;
type ResponseExtractor<T = any> = ResponseExtractorFunction<T> | ResponseExtractorInterface<T>;
/**
 * Judge whether the business is successfully processed and capture the data results of business response
 * @param response Body the HTTP response
 * @return  if request business handle success return business data , else return {@link Promise#reject}
 */
type BusinessResponseExtractorFunction<B = any, T = any> = (responseBody: B) => T | Promise<T> | null | undefined | void;

interface RestfulHttpRequest extends HttpRequest {
    /**
     * request url or request pattern
     * example: https://www.example.com/ap1/v1/users/{id}?name={name}
     */
    url: string;
    /**
     * uri params  and query params
     */
    uriVariables?: UriVariable;
}
/**
 * Interface specifying a basic set of RESTful operations.
 * Implemented by {@link RestTemplate}. Not often used directly, but a useful
 * option to enhance testability, as it can easily be mocked or stubbed.
 */
interface RestOperations {
    /**
     * Retrieve a representation by doing a GET on the specified URL.
     * The response (if any) is converted and returned.
     * <p>URI Template variables are expanded using the given URI variables, if any.
     * @param url the URL
     * @param uriVariables the variables to expand the template  or  uriVariables the map containing variables for the URI template
     * @param headers
     * @return the converted object
     * @see {@link UriVariable}
     */
    getForObject: <E = any>(url: string, uriVariables?: UriVariable, headers?: HeadersInit, context?: HttpRequestContextAttributes) => Promise<E>;
    /**
     * Retrieve a representation by doing a GET on the URI template.
     * The response is converted and stored in an {@link HttpResponse}.
     * <p>URI Template variables are expanded using the given map.
     * @param url the URL
     * @param uriVariables the variables to expand the template  or  uriVariables the map containing variables for the URI template
     * @param headers
     * @return the converted object
     * @see {@link UriVariable}
     */
    getForEntity: <E = any>(url: string, uriVariables?: UriVariable, headers?: HeadersInit, context?: HttpRequestContextAttributes) => Promise<HttpResponse<E>>;
    /**
     * Retrieve all headers of the resource specified by the URI template.
     * <p>URI Template variables are expanded using the given map.
     * @param url the URL
     * @param uriVariables the variables to expand the template  or  uriVariables the map containing variables for the URI template
     * @param headers
     * @return all HTTP headers of that resource
     * @see {@link UriVariable}
     */
    headForHeaders: (url: string, uriVariables?: UriVariable, headers?: HeadersInit, context?: HttpRequestContextAttributes) => Promise<Record<string, string>>;
    /**
     * Create a new resource by POSTing the given object to the URI template,
     * and returns the response as {@link HttpResponse}.
     * <p>URI Template variables are expanded using the given URI variables, if any.
     * <p>The {@code request} parameter can be a {@link HttpRequest} in order to
     * add additional HTTP headers to the request.
     * <p>The body of the entity, or {@code request} itself, can be a
     * @param url the URL
     * @param requestBody the Object to be POSTed (may be {@code null})
     * @param uriVariables the variables to expand the template  or  uriVariables the map containing variables for the URI template
     * @param headers
     * @return the converted object
     * @see {@link UriVariable}
     */
    postForEntity: <E = any>(url: string, requestBody: any, uriVariables?: UriVariable, headers?: HeadersInit, context?: HttpRequestContextAttributes) => Promise<HttpResponse<E>>;
    /**
     * Create a new resource by POSTing the given object to the URI template, and returns the value of
     * the {@code Location} header. This header typically indicates where the new resource is stored.
     * <p>URI Template variables are expanded using the given map.
     * <p>The {@code request} parameter can be a {@link HttpRequest} in order to
     * add additional HTTP headers to the request
     * <p>The body of the entity, or {@code request} itself, can be a
     * @param url the URL
     * @param requestBody the Object to be POSTed (may be {@code null})
     * @param uriVariables the variables to expand the template  or  uriVariables the map containing variables for the URI template
     * @param headers
     * @return the value for the {@code Location} header
     * @see {@link UriVariable}
     */
    postForLocation: (url: string, requestBody: any, uriVariables?: UriVariable, headers?: HeadersInit, context?: HttpRequestContextAttributes) => Promise<string>;
    /**
     * Create a new resource by POSTing the given object to the URI template,
     * and returns the representation found in the response.
     * <p>URI Template variables are expanded using the given URI variables, if any.
     * <p>The {@code request} parameter can be a {@link HttpRequest} in order to
     * add additional HTTP headers to the request.
     * <p>The body of the entity, or {@code request} itself, can be a
     * @param url the URL
     * @param requestBody the Object to be POSTed (may be {@code null})
     * @param uriVariables the variables to expand the template  or  uriVariables the map containing variables for the URI template
     * @param headers
     * @return the converted object
     * @see {@link UriVariable}
     */
    postForObject: <E = any>(url: string, requestBody: any, uriVariables?: UriVariable, headers?: HeadersInit, context?: HttpRequestContextAttributes) => Promise<E>;
    /**
     * Create or update a resource by PUTting the given object to the URI.
     * <p>URI Template variables are expanded using the given URI variables, if any.
     * <p>The {@code request} parameter can be a {@link HttpRequest} in order to
     * add additional HTTP headers to the request.
     * @param url the URL
     * @param requestBody the Object to be PUT (may be {@code null})
     * @param uriVariables the variables to expand the template  or  uriVariables the map containing variables for the URI template
     * @param headers
     * @see {@link UriVariable}
     */
    put: (url: string, requestBody: any, uriVariables?: UriVariable, headers?: HeadersInit, context?: HttpRequestContextAttributes) => Promise<void>;
    /**
     * Update a resource by PATCHing the given object to the URL,
     * and return the representation found in the response.
     * <p>The {@code request} parameter can be a {@link HttpRequest} in order to
     * add additional HTTP headers to the request.
     * <p><b>NOTE: The standard JDK HTTP library does not support HTTP PATCH.
     * You need to use the Apache HttpComponents or OkHttp request factory.</b>
     * @param url the URL
     * @param requestBody the object to be PATCHed (may be {@code null})
     * @param uriVariables the variables to expand the template  or  uriVariables the map containing variables for the URI template
     * @param headers
     * @return the converted object
     * @see {@link UriVariable}
     */
    patchForObject: <E = any>(url: string, requestBody: any, uriVariables?: UriVariable, headers?: HeadersInit, context?: HttpRequestContextAttributes) => Promise<E>;
    /**
     * Delete the resources at the specified URI.
     * <p>URI Template variables are expanded using the given URI variables, if any.
     * @param url the URL
     * @param uriVariables the variables to expand the template  or  uriVariables the map containing variables for the URI template
     * @param headers
     * @see {@link UriVariable}
     */
    delete: (url: string, uriVariables?: UriVariable, headers?: HeadersInit, context?: HttpRequestContextAttributes) => Promise<void>;
    /**
     * Return the value of the Allow header for the given URI.
     * <p>URI Template variables are expanded using the given map.
     * @param url the URL
     * @param uriVariables the variables to expand the template  or  uriVariables the map containing variables for the URI template
     * @param headers
     * @return the value of the allow header
     * @see {@link UriVariable}
     */
    optionsForAllow: (url: string, uriVariables?: UriVariable, headers?: HeadersInit, context?: HttpRequestContextAttributes) => Promise<HttpMethod[]>;
    /**
     * Execute the HTTP method to the given URL, preparing the request with the，and reading the response with a {@link ResponseExtractor}.
     * @param request restful http request
     * @param responseExtractor object that extracts the return value from the response
     * @param context
     * @return an arbitrary object, as returned by the {@link ResponseExtractor}
     */
    exchange: <E = any>(request: RestfulHttpRequest, context?: HttpRequestContextAttributes, responseExtractor?: ResponseExtractor<E>) => Promise<E>;
}

/**
 *  request data encoder
 */
interface HttpRequestDataEncoder {
    /**
     * encode
     * @param request
     * @param otherArgs 其他参数
     */
    encode: (request: RestfulHttpRequest) => Promise<RestfulHttpRequest>;
}

/**
 * encode/format the Date type in the request data or query params
 * Default conversion to timestamp
 */
declare class DateEncoder implements HttpRequestDataEncoder {
    private dateConverter;
    constructor(dateConverter?: DateConverter);
    encode: (request: RestfulHttpRequest) => Promise<RestfulHttpRequest>;
    private converterDate;
}

/**
 * response data
 */
interface HttpResponseDataDecoder<E = any> {
    /**
     * decode
     * @param response
     */
    decode: (response: E) => E;
}

/**
 * http codec
 */
declare class HttpRequestCodec {
    protected encoders: HttpRequestDataEncoder[];
    protected decoders: HttpResponseDataDecoder[];
    constructor(encoders: HttpRequestDataEncoder[], decoders?: HttpResponseDataDecoder[]);
    response: <E = any>(request: RestfulHttpRequest, response: E) => Promise<E>;
    request: (request: RestfulHttpRequest) => Promise<RestfulHttpRequest>;
}

interface HttpResponseEventPublisher {
    publishEvent: (request: HttpRequest, response: HttpResponse) => void;
}
type HttpResponseEventHandler = (request: HttpRequest, response: HttpResponse) => void;
interface HttpResponseEventHandlerSupplier {
    getHandlers: (httpStatus: HttpStatus | number) => HttpResponseEventHandler[];
}
interface HttpResponseEventListener extends HttpResponseEventHandlerSupplier {
    /**
     * 回调指定的的 http status handler
     * @param httpStatus
     * @param handler
     */
    onEvent(httpStatus: HttpStatus | number, handler: HttpResponseEventHandler): void;
    removeListen(httpStatus: HttpStatus | number): void;
    removeListen(httpStatus: HttpStatus | number, handler: HttpResponseEventHandler): void;
}
interface SmartHttpResponseEventListener extends HttpResponseEventListener {
    /**
     * 所有非 2xx 响应都会回调
     * @param handler
     */
    onError(handler: HttpResponseEventHandler): void;
    /**
     * @see HttpStatus#FOUND
     * @param handler
     */
    onFound(handler: HttpResponseEventHandler): void;
    /**
     * @see HttpStatus#UNAUTHORIZED
     * @param handler
     */
    onUnAuthorized(handler: HttpResponseEventHandler): void;
    /**
     * @see HttpStatus#FORBIDDEN
     * @param handler
     */
    onForbidden(handler: HttpResponseEventHandler): void;
    /**
     * remove handle
     * @param handler
     */
    removeErrorListen(handler: HttpResponseEventHandler): void;
}

/**
 * http response event publisher client interceptor
 */
declare class HttpResponseEventPublisherInterceptor<T extends HttpRequest> implements ClientHttpRequestInterceptorInterface<T> {
    /**
     * http event publisher
     * @private
     */
    private readonly publisher;
    constructor(publisher: HttpResponseEventPublisher);
    intercept: (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T>) => Promise<any>;
}

declare class SimpleHttpResponseEventListener implements SmartHttpResponseEventListener {
    private errorHandlers;
    private readonly handlerCaches;
    onEvent: (httpStatus: HttpStatus | number, handler?: HttpResponseEventHandler) => void;
    onFound: (handler: HttpResponseEventHandler) => void;
    onForbidden: (handler: HttpResponseEventHandler) => void;
    onUnAuthorized: (handler: HttpResponseEventHandler) => void;
    onError: (handler: HttpResponseEventHandler) => void;
    removeErrorListen: (handler: HttpResponseEventHandler) => void;
    removeListen(httpStatus: HttpStatus | number, handler?: HttpResponseEventHandler): void;
    getHandlers: (httpStatus: HttpStatus | number) => HttpResponseEventHandler[];
    private isSuccessful;
    private getHandlersByHttpStatus;
    private storeHandlers;
    private filterHandlers;
}

declare class SimpleHttpResponseEventPublisher implements HttpResponseEventPublisher {
    private readonly supplier;
    constructor(supplier: HttpResponseEventHandlerSupplier);
    publishEvent: (request: HttpRequest, response: HttpResponse) => void;
}

/**
 * Api 签名
 * https://www.yuque.com/suiyuerufeng-akjad/wind/zl1ygpq3pitl00qp
 */
declare class ApiSignatureRequestInterceptor<T extends HttpRequest> implements ClientHttpRequestInterceptorInterface<T> {
    private static readonly LOG;
    private readonly signer;
    constructor(signer: ApiRequestSinger);
    intercept: (request: T, context: any, next: any) => Promise<any>;
}

/**
 *  Authentication client http request interceptor
 *
 *  Support blocking 'authorization' refresh
 */
declare class AuthenticationClientHttpRequestInterceptor<T extends HttpRequest> implements ClientHttpRequestInterceptorInterface<T> {
    private readonly authenticationStrategy;
    constructor(authenticationStrategy: AuthenticationStrategy<T>);
    intercept: (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T>) => Promise<any>;
}

interface HttpHeader {
    name: string;
    value: string;
}
/**
 * use match interceptor is executed before the request
 */
declare abstract class MappedInterceptor {
    protected includePatterns: string[];
    protected excludePatterns: string[];
    protected includeMethods: HttpMethod[];
    protected excludeMethods: HttpMethod[];
    protected includeHeaders: HttpHeader[];
    protected excludeHeaders: HttpHeader[];
    protected pathMatcher: PathMatcher;
    constructor(includePatterns: string[], excludePatterns: string[], includeMethods: HttpMethod[], excludeMethods: HttpMethod[], includeHeaders?: string[][], excludeHeaders?: string[][]);
    /**
     * Determine a match for the given lookup path.
     * @param request
     * @return {@code true} if the interceptor applies to the given request path or http methods or http headers
     */
    matches: (request: HttpRequest) => boolean;
    /**
     * Determine a match for the given lookup path.
     * @param lookupPath the current request path
     * @param pathMatcher a path matcher for path pattern matching
     * @return {@code true} if the interceptor applies to the given request path
     */
    matchesUrl: (lookupPath: string, pathMatcher?: PathMatcher) => boolean;
    /**
     * Determine a match for the given http method
     * @param method
     */
    matchesMethod: (method: HttpMethod) => boolean;
    /**
     * Determine a match for the given request headers
     * @param headers
     */
    matchesHeaders: (headers: Record<string, string>) => boolean;
    /**
     *
     * @param matchSource  use match source
     * @param includes
     * @param excludes
     * @param predicate
     */
    private doMatch;
    private converterHeaders;
}

/**
 * match interceptor
 */
declare class MappedClientHttpRequestInterceptor<T extends HttpRequest = HttpRequest> extends MappedInterceptor implements ClientHttpRequestInterceptorInterface<T> {
    private readonly clientInterceptor;
    constructor(clientInterceptor: ClientHttpRequestInterceptor<T>, includePatterns?: string[], excludePatterns?: string[], includeMethods?: HttpMethod[], excludeMethods?: HttpMethod[], includeHeaders?: string[][], excludeHeaders?: string[][]);
    intercept: (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T>) => Promise<any>;
}

/**
 * If the url starts with @xxx, replace 'xxx' with the value of name='xxx' in the routeMapping
 * example url='lb://memberModule/find_member  routeMapping = {memberModule:"http://test.a.b.com/member"} ==> 'http://test.a.b.com/member/find_member'
 */
declare class RoutingClientHttpRequestInterceptor<T extends HttpRequest = HttpRequest> implements ClientHttpRequestInterceptorInterface<T> {
    /**
     * mapping between api module and url
     */
    constructor(routeMapping: Record<string, string> | string);
    intercept: (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T>) => Promise<any>;
}

declare class TraceClientHttpRequestInterceptor<T extends HttpRequest> implements ClientHttpRequestInterceptorInterface<T> {
    private readonly traceIdHeaderName;
    constructor(traceIdHeaderName?: string);
    intercept: (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T, any>) => Promise<any>;
}

declare class Log4jLevel {
    static NONE: Log4jLevel;
    static TRACE: Log4jLevel;
    static DEBUG: Log4jLevel;
    static INFO: Log4jLevel;
    static WARN: Log4jLevel;
    static ERROR: Log4jLevel;
    readonly name: string;
    readonly level: number;
    private constructor();
    static getLogLevel: (level: string) => number;
    static of(name: string, level: number): Log4jLevel;
}

interface Log4jLogger {
    level: Log4jLevel;
    log(...args: any[]): void;
    isLevelEnabled(level?: string): boolean;
    isTraceEnabled(): boolean;
    isDebugEnabled(): boolean;
    isInfoEnabled(): boolean;
    isWarnEnabled(): boolean;
    isErrorEnabled(): boolean;
    trace(message: any, ...args: any[]): void;
    debug(message: any, ...args: any[]): void;
    info(message: any, ...args: any[]): void;
    warn(message: any, ...args: any[]): void;
    error(message: any, ...args: any[]): void;
}

declare abstract class AbstractLog4jLogger implements Log4jLogger {
    protected readonly category: string;
    level: Log4jLevel;
    protected constructor(category?: string, level?: Log4jLevel);
    isLevelEnabled(level: string): boolean;
    isDebugEnabled(): boolean;
    isErrorEnabled(): boolean;
    isInfoEnabled(): boolean;
    isTraceEnabled(): boolean;
    isWarnEnabled(): boolean;
    abstract log(...args: any[]): void;
    debug(message: any, ...args: any[]): void;
    error(message: any, ...args: any[]): void;
    info(message: any, ...args: any[]): void;
    trace(message: any, ...args: any[]): void;
    warn(message: any, ...args: any[]): void;
}

declare class ConsoleLogger extends AbstractLog4jLogger {
    constructor(category?: string, level?: Log4jLevel);
    log(...args: any[]): void;
}

interface HttpLog4jFactory {
    getLogger: (category?: string) => Log4jLogger;
    getRootLogger: () => Log4jLogger;
}
declare let DefaultHttpLo4jFactory: HttpLog4jFactory;
declare const setDefaultHttpLo4jFactory: (factory: HttpLog4jFactory) => void;

/**
 * Downgrade processing without network
 */
interface NoneNetworkFailBack<T extends HttpRequest = HttpRequest> {
    /**
     *  Network is closed
     * @param request
     */
    onNetworkClose: (request: T) => Promise<any> | any;
    /**
     * Network is activated
     */
    onNetworkActive: () => Promise<void> | void;
}

/**
 * default network fail back
 *
 * Prompt only when the network is unavailable and return a simulated request failure result
 */
declare class DefaultNoneNetworkFailBack<T extends HttpRequest = HttpRequest> implements NoneNetworkFailBack<T> {
    onNetworkActive: () => void;
    onNetworkClose: <T_1>(request: T_1) => Promise<never>;
}

/**
 * Network status listener
 */
interface NetworkStatusListener {
    /**
     * get network status
     */
    getNetworkStatus: () => Promise<NetworkStatus>;
    /**
     * listener
     */
    onChange: (callback: (networkStatus: NetworkStatus) => void) => void;
}
interface NetworkStatus {
    /**
     * 当前是否有网络连接
     */
    isConnected: boolean;
    /**
     * 网络类型
     */
    networkType: NetworkType;
}
declare enum NetworkType {
    WIFI = "wifi",
    "2G" = "2g",
    "3G" = "3g",
    "4G" = "4g",
    "5G" = "5g",
    /**
     * Android 下不常见的网络类型
     */
    UN_KNOWN = "unknown",
    /**
     * 无网络
     */
    NONE = "none"
}

/**
 * It needs to be configured first in the {@see ClientHttpRequestInterceptorInterface} list
 *
 * Check whether the client network is available and can be degraded with custom processing.
 * For example, stack requests until the network is available or abandon the request
 *
 * Network interception interceptor during the execution of http client, which conflicts with {@see NetworkFeignClientExecutorInterceptor}
 */
declare class NetworkClientHttpRequestInterceptor<T extends HttpRequest = HttpRequest> implements ClientHttpRequestInterceptorInterface<T> {
    private networkStatusListener;
    private noneNetworkHandler;
    private networkStatus;
    private tryWaitNetworkCount;
    private spinWaitMaxTimes;
    constructor(networkStatusListener: NetworkStatusListener, noneNetworkHandler?: NoneNetworkFailBack<T>, tryWaitNetworkCount?: number, spinWaitMaxTimes?: number);
    intercept: (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T>) => Promise<any>;
    private initNetwork;
    private handleFailBack;
    /**
     * try spin wait network
     */
    private trySpinWait;
}

/**
 * simple network status listener
 *
 * The current request is suspended when the network status is unavailable, waiting for a while, and the request is continued after the network is restored.
 * {@see SimpleNoneNetworkFailBack#maxWaitTime}
 * {@see SimpleNoneNetworkFailBack#maxWaitLength}
 */
declare class SimpleNoneNetworkFailBack<T extends HttpRequest = HttpRequest> implements NoneNetworkFailBack<T> {
    /**
     * 等待队列
     */
    private waitQueue;
    /**
     * 最大的等待时长
     */
    private maxWaitTime;
    /**
     * 最大的等待队列大小
     */
    private maxWaitLength;
    /**
     * @param maxWaitTime
     * @param maxWaitLength
     */
    constructor(maxWaitTime?: number, maxWaitLength?: number);
    onNetworkActive: () => (Promise<void> | void);
    onNetworkClose: (request: T) => (Promise<any> | any);
    private addWaitItem;
    /**
     * 尝试移除无效的项
     */
    private tryRemoveInvalidItem;
    private rejectHttpRequest;
}

/**
 * Defines methods for expanding a URI template with variables.
 * <code>
 *     example
 *     UriTemplateHandler(' http://a.b.com/{module}/{id}?name=李四',{module:'test',id:2})
 *     ==>
 *       http://a.b.com/test/2?name=李四
 * </code>
 */
interface UriTemplateHandlerInterface {
    expand: UriTemplateHandlerFunction;
}
/**
 * Expand the given URI template with a map of URI variables.
 * @param uriTemplate the URI template
 * @param uriVariables variable values
 * @return the created URI instance
 */
type UriTemplateHandlerFunction = (uriTemplate: string, uriVariables: UriVariable) => string;
type UriTemplateHandler = UriTemplateHandlerInterface | UriTemplateHandlerFunction;

/**
 * @see UriTemplateHandlerFunction
 * @param uriTemplate url
 * @param uriVariables url params
 */
declare const defaultUriTemplateFunctionHandler: UriTemplateHandlerFunction;
declare class DefaultUriTemplateHandler implements UriTemplateHandlerInterface {
    expand: UriTemplateHandlerFunction;
}

/**
 * Strategy interface used by the {@link RestTemplate} to determine
 * whether a particular response has an error or not.
 */
interface ResponseErrorHandlerInterFace<T extends HttpRequest = HttpRequest, E = any> {
    /**
     * Indicate whether the given response has any errors.
     * <p>Implementations will typically inspect the
     * {@link HttpResponse#statusCode HttpStatus} of the response.
     * @param response the response to inspect
     * @return {@code true} if the response has an error; {@code false} otherwise
     */
    handleError: ResponseErrorHandlerFunction<T, E>;
}
/**
 * Handle the error in the given response.
 * <p>This method is only called when {@link #hasError(ClientHttpResponse)}
 * has returned {@code true}.
 * @param request the request that resulted in this response
 * @param response the response with the error
 * @param context the context of the request
 */
type ResponseErrorHandlerFunction<T extends HttpRequest = HttpRequest, E = any> = (request: T, response: HttpResponse, context: HttpRequestContextAttributes) => Promise<E>;
type ResponseErrorHandler<T extends HttpRequest = HttpRequest, E = any> = ResponseErrorHandlerInterFace<T> | ResponseErrorHandlerFunction<T>;

/**
 * void response extractor
 * @param response
 */
declare const voidResponseExtractor: (response: HttpResponse) => Promise<void>;
/**
 * object response extractor
 * @param response
 * @param businessResponseExtractor
 */
declare const objectResponseExtractor: ResponseExtractor;
/**
 * head response extractor
 * @param response
 */
declare const headResponseExtractor: (response: HttpResponse) => Promise<Record<string, string>>;
/**
 * options method response extractor
 * @param response
 */
declare const optionsMethodResponseExtractor: (response: HttpResponse) => Promise<HttpMethod[]>;
/**
 * 通过 http 请求方法获取一个 ResponseExtractor
 * @param method http method
 */
declare const restfulResponseExtractorFactory: (method: HttpMethod) => ResponseExtractorFunction<any>;

interface RestTemplateOptions {
    uriTemplateHandler?: UriTemplateHandler;
    responseErrorHandler?: ResponseErrorHandler;
    businessResponseExtractor?: BusinessResponseExtractorFunction;
    codec?: HttpRequestCodec;
}
/**
 * http rest template
 */
declare class RestTemplate implements RestOperations {
    private readonly httpClient;
    private readonly options;
    constructor(httpClient: HttpClient, options?: RestTemplateOptions);
    delete: (url: string, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes) => Promise<void>;
    getForEntity: <E = any>(url: string, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes) => Promise<HttpResponse<E>>;
    getForObject: <E = any>(url: string, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes) => Promise<E>;
    headForHeaders: (url: string, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes) => Promise<Record<string, string>>;
    optionsForAllow: (url: string, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes) => Promise<HttpMethod[]>;
    patchForObject: <E = any>(url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes) => Promise<E>;
    postForEntity: <E = any>(url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes) => Promise<HttpResponse<E>>;
    postForLocation: (url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes) => Promise<string>;
    postForObject: <E = any>(url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes) => Promise<E>;
    put: (url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes) => Promise<void>;
    exchange: <E = any>(request: RestfulHttpRequest, context?: HttpRequestContextAttributes, responseExtractor?: ResponseExtractor<E>) => Promise<E>;
}

type CloseRequestProgressBarFunction = () => void;
type RequestProgressBarFunction = () => CloseRequestProgressBarFunction;

/**
 * process bar client http request interceptor
 */
declare class ProcessBarClientHttpRequestInterceptor<T extends HttpRequest> implements ClientHttpRequestInterceptorInterface<T> {
    /**
     * 进度条
     */
    private readonly progressBar;
    /**
     * 防止抖动，在接口很快响应的时候，不显示进度条
     */
    private readonly preventJitter;
    /**
     * 进度条计数器，用于在同时发起多个请求时，
     * 统一控制加载进度条
     */
    private count;
    /**
     * 当前执行的定时器
     */
    private timerId;
    /**
     * 关闭 request progress bar fn
     */
    private closeRequestProgressBarFunction;
    constructor(progressBar: RequestProgressBarFunction, preventJitter?: boolean);
    intercept: (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T>) => Promise<any>;
    private showProgressBar;
    private showRequestProgressBar;
    private closeRequestProgressBar;
}

/**
 * converter a single function interface
 * @param handle
 * @param methodName
 * @return I  对应的接口实例
 */
declare const convertFunctionInterface: <T, I>(handle: T | I, methodName: string) => I;

declare const responseIsJson: (headers: Record<string, string>) => boolean;
declare const responseIsText: (headers: Record<string, string>) => boolean;
declare const responseIsFile: (headers: Record<string, string>) => boolean;

/**
 * request method is support request body
 * @param method
 */
declare const supportRequestBody: (method: HttpMethod | string) => boolean;
/**
 * serialize http request body for content type
 * @param body
 * @param contentType
 * @param filterNoneValue  filter none value
 */
declare const serializeRequestBody: (body: SupportSerializableBody, contentType: HttpMediaType, filterNoneValue?: boolean) => string;
declare const filterNoneValueAndNewObject: (body: Record<string, any> | Array<Record<string, any>>) => {};
/**
 * assemble the query string
 *
 * @param obj
 * @param filterNoneValue
 * @param sep
 * @param eq
 * @param name
 */
declare const queryStringify: (obj: ParsedUrlQueryInput, filterNoneValue?: boolean, sep?: string, eq?: string, name?: string) => string;

/**
 * replace url path variable
 * @param uriVariables
 * @param uriVariablesIsArray
 */

/**
 * replace the value of bdc in the form ‘a_{bdc}’
 * <code>
 *     support 'a_{name:defaultValue}' format with default values
 * </code>
 * @param uriTemplate
 * @param uriVariables
 */
declare const replacePathVariableValue: (uriTemplate: string, uriVariables: UriVariable) => string;

export { AbstractHttpClient, AbstractLog4jLogger, ApiSignatureRequestInterceptor, AuthenticationClientHttpRequestInterceptor, AuthenticationStrategy, AuthenticationToken, BusinessResponseExtractorFunction, CONTENT_LENGTH_HEAD_NAME, CONTENT_TRANSFER_ENCODING_HEAD_NAME, CONTENT_TYPE_HEAD_NAME, ClientHttpRequestInterceptor, ConsoleLogger, DEFAULT_SERVICE_NAME, DateConverter, DateEncoder, DefaultHttpClient, DefaultHttpLo4jFactory, DefaultNoneNetworkFailBack as DefaultNetworkStatusListener, DefaultUriTemplateHandler, HTTPS_SCHEMA, HTTP_SCHEMA, HttpAdapter, HttpClient, HttpLog4jFactory, HttpMethod, HttpRequest, HttpRequestCodec, HttpRequestContextAttributes, HttpRequestDataEncoder, HttpResponse, HttpResponseDataDecoder, HttpResponseEventHandler, HttpResponseEventHandlerSupplier, HttpResponseEventListener, HttpResponseEventPublisher, HttpResponseEventPublisherInterceptor, HttpRetryOptions, HttpStatus, LB_SCHEMA, Log4jLevel, Log4jLogger, MappedClientHttpRequestInterceptor, MappedInterceptor, NetworkClientHttpRequestInterceptor, NetworkStatus, NetworkStatusListener, NetworkType, NoneNetworkFailBack, ProcessBarClientHttpRequestInterceptor, QueryParamType, RefreshTokenAuthenticationStrategy, RequestProgressBarFunction, ResponseErrorHandler, ResponseErrorHandlerFunction, ResponseErrorHandlerInterFace, ResponseExtractor, ResponseExtractorFunction, ResponseExtractorInterface, RestOperations, RestTemplate, RestfulHttpRequest, RetryHttpClient, RoutingClientHttpRequestInterceptor, SimpleHttpResponseEventListener, SimpleHttpResponseEventPublisher, SimpleNoneNetworkFailBack as SimpleNetworkStatusListener, SmartHttpResponseEventListener, SupportSerializableBody, TraceClientHttpRequestInterceptor, UNAUTHORIZED_RESPONSE, UriTemplateHandler, UriTemplateHandlerFunction, UriTemplateHandlerInterface, UriVariable, appendRouteMapping, convertFunctionInterface, defaultUriTemplateFunctionHandler, filterNoneValueAndNewObject, getRealRequestUrl, headResponseExtractor, objectResponseExtractor, optionsMethodResponseExtractor, queryStringify, replacePathVariableValue, responseIsFile, responseIsJson, responseIsText, restfulResponseExtractorFactory, serializeRequestBody, setDefaultHttpLo4jFactory, stringDateConverter, supportRequestBody, timeStampDateConverter, voidResponseExtractor };
