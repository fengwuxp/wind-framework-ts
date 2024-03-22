import {HttpRequest, HttpRequestContextAttributes, HttpResponse, SupportSerializableBody} from "../Http";
import {HttpClient} from "./HttpClient";
import {HttpMethod} from "../enums/HttpMethod";


/**
 * abstract http client
 * Request header with 'Content-Type' as 'application/x-www-form-urlencoded' is provided by default
 */
export abstract class AbstractHttpClient<T extends HttpRequest = HttpRequest> implements HttpClient<T> {

    delete = (url: string, context?: HttpRequestContextAttributes, headers?: HeadersInit): Promise<HttpResponse> => {
        return this.send({
            method: HttpMethod.DELETE,
            url,
            headers,
        } as T, context);
    };

    get = (url: string, context?: HttpRequestContextAttributes, headers?: HeadersInit): Promise<HttpResponse> => {
        return this.send({
            method: HttpMethod.GET,
            url,
            headers,
        } as T, context);
    };

    head = (url: string, context?: HttpRequestContextAttributes, headers?: HeadersInit): Promise<HttpResponse> => {
        return this.send({
            method: HttpMethod.HEAD,
            url,
            headers,
        } as T, context);
    };

    patch = (url: string, body: SupportSerializableBody, context?: HttpRequestContextAttributes, headers?: HeadersInit): Promise<HttpResponse> => {
        return this.send({
            method: HttpMethod.PATCH,
            url,
            headers,
        } as T, context);
    };

    post = (url: string, body: SupportSerializableBody, context?: HttpRequestContextAttributes, headers?: HeadersInit): Promise<HttpResponse> => {
        return this.send({
            method: HttpMethod.POST,
            url,
            headers,
        } as T, context);
    };

    put = (url: string, body: SupportSerializableBody, context?: HttpRequestContextAttributes, headers?: HeadersInit): Promise<HttpResponse> => {
        return this.send({
            method: HttpMethod.PUT,
            url,
            headers,
        } as T, context);
    };

    /**
     * send a http request to a remote server
     * @param request
     * @param context
     */
    abstract send: (request: T, context?: HttpRequestContextAttributes) => Promise<HttpResponse>;
}
