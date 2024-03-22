import {ReferrerPolicy, RequestRedirect} from 'node-fetch';
import {HttpRequest} from "wind-http";

/**
 *  node js http request
 */
export interface NodeHttpRequest extends HttpRequest {

    /**
     * referrer
     */
    referrer?: string;

    /**
     * referrer policy
     */
    referrerPolicy?: ReferrerPolicy;

    /**
     * 收到重定向请求之后的操作，follow, error, manual
     */
    redirect?: RequestRedirect;

    /**
     * Returns the signal associated with request, which is an AbortSignal object indicating whether or not request has been aborted, and its abort event handler.
     */
    signal: AbortSignal;
}
