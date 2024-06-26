import {FeignClientOptions} from "../annotations/FeignClientAnnotationFactory";
import {FeignHttpClientFunction} from "./FeignHttpClientFunction";
import {BaseRequestMappingOptions, RequestMappingOptions} from "../annotations/mapping/Mapping";
import {FeignProxyClient} from "../support/FeignProxyClient";
import {Feign} from "../annotations/Feign";
import {RequestMapping} from "../annotations/mapping/RequestMapping";
import {FeignClientConfiguration} from "../configuration/FeignClientConfiguration";
import {HttpMethod} from "wind-http";


export interface FeignHttpFunctionBuilder {

    request: <T, R>(requestMapping: RequestMappingOptions) => FeignHttpClientFunction<T, R>;

    get: <T, R>(mapping: BaseRequestMappingOptions) => FeignHttpClientFunction<T, R>;

    post: <T, R>(mapping: BaseRequestMappingOptions) => FeignHttpClientFunction<T, R>;

    put: <T, R>(mapping: BaseRequestMappingOptions) => FeignHttpClientFunction<T, R>;

    delete: <T, R>(mapping: BaseRequestMappingOptions) => FeignHttpClientFunction<T, R>;

    patch: <T, R>(mapping: BaseRequestMappingOptions) => FeignHttpClientFunction<T, R>;

    head: <T, R>(mapping: BaseRequestMappingOptions) => FeignHttpClientFunction<T, R>;
}


class _InnerFeignHttpFunctionBuilder implements FeignHttpFunctionBuilder {

    private readonly proxyClass;

    private readonly feignProxyHttpClient: FeignProxyClient<FeignClientConfiguration>;

    private methodIndex = 0;

    constructor(proxyClass, options: FeignClientOptions<FeignClientConfiguration>) {
        this.proxyClass = proxyClass;
        const FeignHttpClientConstructor: {
            new(...args: any[]): FeignProxyClient<FeignClientConfiguration>
        } = Feign(options)(proxyClass);
        this.feignProxyHttpClient = new FeignHttpClientConstructor();
    }

    delete = <T, R>(mapping: BaseRequestMappingOptions): FeignHttpClientFunction<T, R> => {
        return this.request({
            ...mapping,
            method: HttpMethod.DELETE
        });
    }

    get = <T, R>(mapping: BaseRequestMappingOptions): FeignHttpClientFunction<T, R> => {
        return this.request({
            ...mapping,
            method: HttpMethod.GET
        });
    }

    head = <T, R>(mapping: BaseRequestMappingOptions): FeignHttpClientFunction<T, R> => {
        return this.request({
            ...mapping,
            method: HttpMethod.HEAD
        });
    }

    patch = <T, R>(mapping: BaseRequestMappingOptions): FeignHttpClientFunction<T, R> => {
        return this.request({
            ...mapping,
            method: HttpMethod.PATCH
        });
    }

    post = <T, R>(mapping: BaseRequestMappingOptions): FeignHttpClientFunction<T, R> => {
        return this.request({
            ...mapping,
            method: HttpMethod.POST
        });
    }

    put = <T, R>(mapping: BaseRequestMappingOptions): FeignHttpClientFunction<T, R> => {
        return this.request({
            ...mapping,
            method: HttpMethod.PUT
        });
    }

    request = <T, R>(requestMapping: RequestMappingOptions): FeignHttpClientFunction<T, R> => {
        const methodName = this.defineHttpRequestMethod(requestMapping);
        return this.getHttpRequestMethod(methodName);
    }

    private defineHttpRequestMethod = (requestMapping: RequestMappingOptions): string => {
        const methodName = `${requestMapping.method}_${requestMapping.value ?? ""}_${this.methodIndex++}`;
        if (this.proxyClass.prototype[methodName] == null) { // 在类原型上定义方法
            RequestMapping(requestMapping)(this.proxyClass.prototype, methodName)
        }
        return methodName;
    }

    private getHttpRequestMethod = (methodName: string) => {
        return this.feignProxyHttpClient[methodName];
    }
}


/**
 * 获取一个 feign http function builder
 * <code>
 *  const functionBuilder = feignHttpFunctionBuilder();
 *  const findUserById = functionBuilder.get({value:"/user/{id}"});
 * <code>
 *
 * @param options
 */
export const feignHttpFunctionBuilder = (options: FeignClientOptions<FeignClientConfiguration>): FeignHttpFunctionBuilder => {
    return new _InnerFeignHttpFunctionBuilder(class {
    }, options);
}