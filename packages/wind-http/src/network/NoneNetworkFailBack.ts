import {HttpRequest, HttpResponse} from "../Http";
import {HttpStatus} from "../enums/HttpStatus";


/**
 * Downgrade processing without network
 */
export interface NoneNetworkFailBack<T extends HttpRequest = HttpRequest> {

    /**
     *  Network is closed
     * @param request
     */
    onNetworkClose: (request: T) => Promise<any> | any;

    /**
     * Network is activated
     */
    onNetworkActive: () => Promise<void> | void;
}

/**
 * You can use this value to indicate network errors in global error prompts
 * or use FeignUIToast {@see ../ui/RequestToast}  {@see ./DefaultNetworkStatusListener}
 */
export const MOCK_NETWORK_FAILURE_TEXT = "network fail";

/**
 * mock in network failure response
 */
export const MOCK_NETWORK_FAILURE_RESPONSE: HttpResponse = {
    ok: false,
    statusCode: HttpStatus.GATEWAY_TIMEOUT,
    statusText: MOCK_NETWORK_FAILURE_TEXT,
    data: undefined
};
