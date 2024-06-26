import {HttpMethod} from "wind-http";
import {FeignClient} from "../../FeignClient";
import {registerAnnotationMetadata} from "../../support/AnnotationMetadataRegister";


export type MappingMethod = HttpMethod | string;

export type MappingHeaderType = Array<boolean | string | number | Date>;

/**
 * query params type
 */
export type MappingHeaders =
    Record<string, string>
    | Record<string, boolean | number | string | Date | MappingHeaderType>;


export interface BaseRequestMappingOptions {
    /**
     * 请求的uri地址
     * 支持path variable 例如：getMember/{memberId}，表明参数中的memberId将作为路径参数，命名要保持一致
     */
    value?: string;


    /**
     * 自定义请求头，支持命名占位符，且命名占位符支持默认值
     *
     * 1：固定值，例如 {myHeader:"1234"}
     * 2：将参数中的某些字段当做请求头，例如：{token:"{token:defaultValue}"}
     */
    headers?: MappingHeaders;

    /**
     * 默认的查询参数
     */
    params?: MappingHeaders | string[];

    /**
     * 超时时间，
     * 单位：毫秒
     * 默认 10 * 1000 毫秒
     */
    timeout?: number;


    /**
     * 提交的数据类型
     * @see {@link ../constant/http/MediaType}
     * 默认 MediaType.JSON_UTF8
     */
    consumes?: string[];

    /**
     * 响应的数据类型
     * @see {@link ../constant/http/MediaType}
     * 默认 MediaType.JSON_UTF8
     */
    produces?: string[];

    /**
     * 查询参数名称列表
     * 在提交数据时，会根据这个参数来确定提交的数据集
     */
    queryArgNames?: string[];

    /**
     * 请求体参数名称
     * 在提交数据时，会根据这个参数来确定提交的数据集
     */
    bodyArgName?: string;
}


export interface RequestMappingOptions extends BaseRequestMappingOptions {


    /**
     * 请求 method
     */
    method: HttpMethod;

}

/**
 * url mapping 类型
 */
export type Mapping<T extends BaseRequestMappingOptions = BaseRequestMappingOptions> = (options: T) => Function;

/**
 * 生成 Mapping 注解 的方法
 * @param method
 */
export function generateMapping<T extends BaseRequestMappingOptions>(method?: MappingMethod): Mapping<T> {

    return function <E extends FeignClient>(options: T): Function {


        /**
         * decorator
         * @param  {E} target                        装饰的属性所属的类的原型，注意，不是实例后的类。如果装饰的是 T 的某个属性，这个 target 的值就是 T.prototype
         * @param  {string} name                     装饰的属性的 key
         * @param  {PropertyDescriptor} descriptor   装饰的对象的描述对象
         */
        return function (target: E, name: string, descriptor: PropertyDescriptor): E {

            //通过注解生成feign的代理配置
            const requestMapping: RequestMappingOptions = {
                method,
                ...(options as any)
            };

            registerAnnotationMetadata(target, name, {
                requestMapping
            });
            return target;

        };
    }
}
