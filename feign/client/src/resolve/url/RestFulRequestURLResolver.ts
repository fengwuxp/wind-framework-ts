import {RequestURLResolver} from "./RequestURLResolver";
import {FeignClientMemberOptions, FeignProxyClient} from "../../support/FeignProxyClient";
import StringUtils from 'wind-common-utils/lib/string/StringUtils';
import {LB_SCHEMA} from "wind-http";
import {FeignClientConfiguration} from "../../configuration/FeignClientConfiguration";


/**
 * restful request url resolver
 * @param apiService
 * @param methodName
 */
export const restfulRequestURLResolver: RequestURLResolver = (apiService: FeignProxyClient, methodName: string): string => {

    const feignOptions = apiService.options();

    //生成 例如 @member/member/queryMember 或 @default/member/{memberId}
    return `${getApiUriByApiService(apiService, feignOptions)}${getApiUriByApiServiceMethod(apiService, methodName)}`;
};

/**
 * 通过ApiService 生成uri
 * @param apiService
 * @param feignOptions
 */
export const getApiUriByApiService = (apiService: FeignProxyClient, feignOptions: FeignClientMemberOptions<FeignClientConfiguration>) => {

    const {apiServiceName, url} = feignOptions;
    if (StringUtils.hasText(url)) {
        return `${url}`;
    }
    const serviceName = apiService.serviceName();
    return `${LB_SCHEMA}${apiServiceName}${serviceName.startsWith("/") ? serviceName : "/" + serviceName}`;
};


/**
 * 通过 ApiService Method 生成uri
 * @param apiService
 * @param methodName
 */
const getApiUriByApiServiceMethod = (apiService: FeignProxyClient, methodName: string) => {

    const apiServiceConfig = apiService.getFeignMethodConfig(methodName);
    let value;
    if (apiServiceConfig.requestMapping == null || apiServiceConfig.requestMapping.value == null) {
        value = "";
    } else {
        value = apiServiceConfig.requestMapping.value
    }
    if (!StringUtils.hasText(value)) {
        return value;
    }

    return value.startsWith("/") ? value : `/${value}`;
};


