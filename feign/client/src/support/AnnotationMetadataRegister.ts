import {FeignProxyClient} from "./FeignProxyClient";
import {GenerateAnnotationMethodConfig} from "./GenerateAnnotationMethodConfig";
import {FeignClientMethodConfig} from "./FeignClientMethodConfig";
import {Reflection as Reflect} from '@abraham/reflection';
import {getFeignClientMethodConfig} from "../annotations/FeignClientAnnotationFactory";
import {FEIGN_CLINE_META_KEY} from "../FeignConstants";

/**
 * 注册注解（装饰器）元数据
 * @param targetService
 * @param methodName
 * @param options
 */
export const registerAnnotationMetadata: GenerateAnnotationMethodConfig = (targetService: FeignProxyClient, methodName: string, options: FeignClientMethodConfig) => {

    if (typeof targetService[methodName] !== "function") {
        targetService[methodName]=function (...args) {}
    }

    const target = targetService.constructor;
    const feignClientMethodConfig: FeignClientMethodConfig = getFeignClientMethodConfig(target, methodName);
    Reflect.defineMetadata(FEIGN_CLINE_META_KEY, {
        ...feignClientMethodConfig,
        ...options
    }, target, methodName);

};
