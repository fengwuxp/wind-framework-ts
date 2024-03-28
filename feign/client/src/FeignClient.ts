import {HttpRequestContextAttributes} from "wind-http";

/**
 *  mark interface
 *  feign client
 */
export interface FeignClient {


}

export interface FeignRequestOptions extends HttpRequestContextAttributes{

    /**
     * 是否过滤提交数据中的 空字符串，null的数据，数值类型的NaN
     * 默认：false
     * 全局开启可以通过 {@link FeignClientConfiguration#globalOptions}
     */
    filterNoneValue?: boolean;
}