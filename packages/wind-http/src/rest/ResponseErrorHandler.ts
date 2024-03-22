import {HttpRequest, HttpRequestContextAttributes, HttpResponse} from "../Http";


/**
 * Strategy interface used by the {@link RestTemplate} to determine
 * whether a particular response has an error or not.
 */
export interface ResponseErrorHandlerInterFace<T extends HttpRequest = HttpRequest, E = any> {

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
export type ResponseErrorHandlerFunction<T extends HttpRequest = HttpRequest, E = any> = (request: T, response: HttpResponse, context: HttpRequestContextAttributes) => Promise<E>;

export type ResponseErrorHandler<T extends HttpRequest = HttpRequest, E = any> =
    ResponseErrorHandlerInterFace<T>
    | ResponseErrorHandlerFunction<T>;
