import {HttpAdapter, HttpRequest, HttpRequestContextAttributes, HttpResponse, SupportSerializableBody} from "../Http";


/**
 * http request client
 * Provides basic http request capabilities
 * Extend from {@see HttpAdapter }
 */
export interface HttpClient<T extends HttpRequest = HttpRequest> extends HttpAdapter<T> {

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

