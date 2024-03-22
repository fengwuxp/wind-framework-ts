import {HttpMethod} from "./enums/HttpMethod";


export type SupportSerializableBody = Record<string, any> | Array<any> | string | undefined;

/**
 * uri path variable
 * example url: "http://a.b.com/{module}/{id}", ["member",1]  ==> "http://a.b.com/member/1"
 */
type UriPathVariable = Array<boolean | string | number | Date>;

/**
 * query params type
 */
export type QueryParamType = Record<string, boolean | number | string | Date | UriPathVariable>;

/**
 * uri variable type
 * example url: "http://a.b.com/",{module:"member",id:1}  ==> "http://a.b.com/?module=member&id=1"
 */
export type UriVariable = UriPathVariable | QueryParamType;


/**
 * The payload object used to make the HTTP request
 * {@see HttpAdapter}
 * {@see HttpClient}
 */
export interface HttpRequest {

    /**
     * http request method
     * {@see HttpMethod}
     */
    method: HttpMethod | string;

    /**
     * 请求url
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
export interface HttpRetryOptions {

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
export interface HttpRequestContextAttributes extends Record<string, any> {

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
export interface HttpResponse<T = any> {

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
export interface HttpAdapter<T extends HttpRequest = HttpRequest> {

    /**
     * send a http request to a remote server
     * @param request http request
     * @param context request context
     */
    send: (request: T, context: HttpRequestContextAttributes) => Promise<HttpResponse>;
}