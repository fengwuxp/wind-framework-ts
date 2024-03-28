import {FeignClient} from "../FeignClient";
import {FeignClientMethodConfig} from "./FeignClientMethodConfig";
import {FeignClientConfiguration} from "../configuration/FeignClientConfiguration";


export interface BaseFeignClientOptions {

    /**
     * api service name
     * 可以通过 api service name 作为标识发起请求
     * 例如：lb://{apiServiceName}/api/v1/xx
     */
    apiServiceName?: string;

    /**
     * 请求uri
     * 默认：类名
     * request uri，default use feign client class name
     * example: SystemServiceFeignClient ==> SystemService
     */
    value?: string;

    /**
     * 绝对URL或可解析的主机名（协议是可选的）
     * an absolute URL or resolvable hostname (the protocol is optional)
     */
    url?: string;
}

export interface FeignClientMemberOptions<C extends FeignClientConfiguration> extends BaseFeignClientOptions {

    /**
     * feign configuration
     */
    configuration?: C;
}

/**
 * feign proxy client
 */
export interface FeignProxyClient<C extends FeignClientConfiguration = FeignClientConfiguration> extends FeignClient {


    /**
     * service name or access path
     */
    readonly serviceName: () => string;

    /**
     * feign proxy options
     */
    readonly options: () => Readonly<FeignClientMemberOptions<C>>;

    /**
     * get feign configuration
     */
    readonly configuration: <C>() => Promise<Readonly<C>>;

    /**
     * 获取获取接口方法的配置
     * @param serviceMethod  服务方法名称
     */
    getFeignMethodConfig: (serviceMethod: string) => Readonly<FeignClientMethodConfig>;

}
