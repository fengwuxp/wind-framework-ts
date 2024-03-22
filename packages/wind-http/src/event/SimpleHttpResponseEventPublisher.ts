import {HttpResponseEventHandlerSupplier, HttpResponseEventPublisher} from "./HttpResponseEvent";
import {HttpRequest, HttpResponse} from "../Http";


export default class SimpleHttpResponseEventPublisher implements HttpResponseEventPublisher {

    private readonly supplier: HttpResponseEventHandlerSupplier;

    constructor(supplier: HttpResponseEventHandlerSupplier) {
        this.supplier = supplier;
    }

    publishEvent = (request: HttpRequest, response: HttpResponse): void => {
        (this.supplier.getHandlers(response.statusCode) || []).forEach(handler => handler(request, response));
    }

}