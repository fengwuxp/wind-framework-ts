import {HttpRequest, HttpResponse} from "../Http";
import {HttpStatus} from "../enums/HttpStatus";


export interface HttpResponseEventPublisher {

    publishEvent: (request: HttpRequest, response: HttpResponse) => void;
}

export type HttpResponseEventHandler = (request: HttpRequest, response: HttpResponse) => void;

export interface HttpResponseEventHandlerSupplier {

    getHandlers: (httpStatus: HttpStatus | number) => HttpResponseEventHandler[];
}

export interface HttpResponseEventListener extends HttpResponseEventHandlerSupplier {
    /**
     * 回调指定的的 http status handler
     * @param httpStatus
     * @param handler
     */
    onEvent(httpStatus: HttpStatus | number, handler: HttpResponseEventHandler): void;

    removeListen(httpStatus: HttpStatus | number): void;

    removeListen(httpStatus: HttpStatus | number, handler: HttpResponseEventHandler): void;
}

export interface SmartHttpResponseEventListener extends HttpResponseEventListener {

    /**
     * 所有非 2xx 响应都会回调
     * @param handler
     */
    onError(handler: HttpResponseEventHandler): void;

    /**
     * @see HttpStatus#FOUND
     * @param handler
     */
    onFound(handler: HttpResponseEventHandler): void

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