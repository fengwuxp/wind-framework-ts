import {RequestMappingOptions} from "../annotations/mapping/Mapping";
import {ValidateSchemaOptions} from "../annotations/validator/VailidatorSchema";
import {HttpRetryOptions} from "wind-http";

/**
 * feign的代理相关配置
 */
export interface FeignClientMethodConfig {

    /**
     * 请求配置
     */
    requestMapping?: RequestMappingOptions;

    /**
     * 重试相关配置
     */
    retryOptions?: HttpRetryOptions;

    /**
     * 数据验证配置
     */
    validateSchemaOptions?: ValidateSchemaOptions<any>;
}
