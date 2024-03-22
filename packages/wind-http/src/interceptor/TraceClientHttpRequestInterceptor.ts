import {HttpRequest, HttpRequestContextAttributes} from "../Http";
import {
    ClientHttpRequestExecution,
    ClientHttpRequestInterceptorInterface
} from "../client/ClientHttpRequestInterceptor";
import StringUtils from "wind-common-utils/lib/string/StringUtils";

export default class TraceClientHttpRequestInterceptor<T extends HttpRequest> implements ClientHttpRequestInterceptorInterface<T> {

    private readonly traceIdHeaderName: string;

    constructor(traceIdHeaderName?: string) {
        this.traceIdHeaderName = traceIdHeaderName || "Wind-Trace-Id";
    }

    intercept = (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T, any>): Promise<any> => {
        // TODO use wind-tracer
        request.headers[this.traceIdHeaderName] = StringUtils.genNonce();
        return next(request, context)
    }


}