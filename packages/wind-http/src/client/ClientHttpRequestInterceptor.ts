import {HttpRequest, HttpRequestContextAttributes} from "../Http";


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
export type ClientHttpRequestExecution<T extends HttpRequest = HttpRequest, R = any> = (request: T, context: HttpRequestContextAttributes,) => Promise<R>;


/**
 *  Intercept the given request, and return a response
 *
 *  @param reqest The request to be intercepted
 *  @param context The context of the request
 *  @return promise request response object
 */
export type ClientHttpRequestInterceptorFunction<T extends HttpRequest = HttpRequest, R = any> = (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T, R>) => Promise<R>;


/**
 * Intercepts client-side HTTP requests.
 * Only executed in http client
 * {@see HttpClient#send}
 * {@see DefaultHttpClient#send}
 */
export interface ClientHttpRequestInterceptorInterface<T extends HttpRequest = HttpRequest, R = any> {

    /**
     * Intercept before http request, you can change the requested information
     */
    intercept: ClientHttpRequestInterceptorFunction<T, R>;
}


/**
 * Throw an exception or Promise#reject will interrupt the request
 */
export type ClientHttpRequestInterceptor<T extends HttpRequest = HttpRequest> =
    ClientHttpRequestInterceptorFunction<T>
    | ClientHttpRequestInterceptorInterface<T>
