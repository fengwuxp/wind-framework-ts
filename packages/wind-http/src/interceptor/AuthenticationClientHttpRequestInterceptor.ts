import {HttpRequest, HttpRequestContextAttributes} from "../Http";
import {
    ClientHttpRequestExecution,
    ClientHttpRequestInterceptorInterface
} from "../client/ClientHttpRequestInterceptor";
import {AuthenticationStrategy} from "../client/AuthenticationStrategy";


/**
 *  Authentication client http request interceptor
 *
 *  Support blocking 'authorization' refresh
 */
export default class AuthenticationClientHttpRequestInterceptor<T extends HttpRequest> implements ClientHttpRequestInterceptorInterface<T> {

    private readonly authenticationStrategy: AuthenticationStrategy<T>;

    constructor(authenticationStrategy: AuthenticationStrategy<T>) {
        this.authenticationStrategy = authenticationStrategy;
    }

    intercept = (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T>): Promise<any> => {
        return this.authenticationStrategy.authentication(request).then(req => next(req, context));
    }
}
