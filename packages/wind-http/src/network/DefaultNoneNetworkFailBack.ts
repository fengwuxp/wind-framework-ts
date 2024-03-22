import {MOCK_NETWORK_FAILURE_RESPONSE, NoneNetworkFailBack} from "./NoneNetworkFailBack";
import {HttpRequest} from "../Http";

/**
 * default network fail back
 *
 * Prompt only when the network is unavailable and return a simulated request failure result
 */
export default class DefaultNoneNetworkFailBack<T extends HttpRequest = HttpRequest> implements NoneNetworkFailBack<T> {

    onNetworkActive = () => {

    };

    onNetworkClose = <T>(request: T) => {
        return Promise.reject(MOCK_NETWORK_FAILURE_RESPONSE);
    };


}

