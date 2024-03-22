import {HttpRequest, HttpRequestContextAttributes} from "../Http";
import {
    ClientHttpRequestExecution,
    ClientHttpRequestInterceptorInterface
} from "../client/ClientHttpRequestInterceptor";
import {HttpResponseEventPublisher} from "./HttpResponseEvent";

/**
 * http response event publisher client interceptor
 */
export default class HttpResponseEventPublisherInterceptor<T extends HttpRequest> implements ClientHttpRequestInterceptorInterface<T> {

    /**
     * http event publisher
     * @private
     */
    private readonly publisher: HttpResponseEventPublisher;

    constructor(publisher: HttpResponseEventPublisher) {
        this.publisher = publisher;
    }

    intercept = (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T>): Promise<any> => {
        return next(request, context).then((response: any) => {
            this.publisher.publishEvent(request, response);
            return Promise.reject(response)
        });
    }

}