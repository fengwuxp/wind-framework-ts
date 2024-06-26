import {FeignClient} from "../../FeignClient";
import {registerAnnotationMetadata} from "../../support/AnnotationMetadataRegister";
import {HttpRetryOptions} from "wind-http";

export const DEFAULT_RETRY_OPTIONS: HttpRetryOptions = {
    retries: 1,
    maxTimeout: 15000,
    delay: 100
};

/**
 * 请求重试
 * @param options
 * @constructor
 */
export const FeignRetry = <T extends FeignClient>(options: HttpRetryOptions): Function => {

    /**
     * decorator
     * @param  {T} target                        装饰的属性所属的类的原型，注意，不是实例后的类。如果装饰的是 T 的某个属性，这个 target 的值就是 T.prototype
     * @param  {string} name                     装饰的属性的 key
     * @param  {PropertyDescriptor} descriptor   装饰的对象的描述对象
     */
    return function (target: T, name: string, descriptor: PropertyDescriptor): T {
        registerAnnotationMetadata(target, name, {
            retryOptions: {
                ...DEFAULT_RETRY_OPTIONS,
                ...options
            }
        });
        return target;
    }
}
