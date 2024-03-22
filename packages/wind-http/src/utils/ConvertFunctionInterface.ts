import {
    ClientHttpRequestInterceptor,
    ClientHttpRequestInterceptorInterface
} from "../client/ClientHttpRequestInterceptor";
import {HttpRequest} from "../Http";

/**
 * converter a single function interface
 * @param handle
 * @param methodName
 * @return I  对应的接口实例
 */
export const convertFunctionInterface = <T, I/*interface type*/>(handle: T | I, methodName: string): I => {
    if (typeof handle == "function") {
        return {
            [methodName]: handle as Function
        } as I;
    } else {
        return handle as I;
    }
};

export const convertClientHttpRequestInterceptor = <T extends HttpRequest>(interceptor: ClientHttpRequestInterceptor<T>) => {
    return convertFunctionInterface<ClientHttpRequestInterceptor<T>, ClientHttpRequestInterceptorInterface<T>>(interceptor, "intercept")
}