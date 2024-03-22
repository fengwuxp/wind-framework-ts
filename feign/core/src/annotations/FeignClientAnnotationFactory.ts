import {BaseFeignClientOptions, FeignClientMemberOptions, FeignProxyClient} from "../support/FeignProxyClient";
import {convertFunctionInterface, DEFAULT_SERVICE_NAME} from "wind-http";
import {FeignClientBuilder, FeignClientBuilderInterface} from "../FeignClientBuilder";
import {defaultFeignClientBuilder} from "../executor/DefaultFeignClientBuilder";
import {FeignClientConfiguration} from "../configuration/FeignClientConfiguration";
import FeignConfigurationRegistry from "../configuration/FeignConfigurationRegistry";
import {FeignClientMethodConfig} from "../support/FeignClientMethodConfig";
import {FEIGN_CLINE_META_KEY} from "../FeignConstants";


export type FeignConfigurationConstructor<C extends FeignClientConfiguration = FeignClientConfiguration> = { new(...args: any[]): C }

export interface FeignClientOptions<C extends FeignClientConfiguration> extends BaseFeignClientOptions {

    /**
     * feign configuration
     */
    configuration?: FeignConfigurationConstructor<C>;
}


export type FeignClientType = "http" | "ws" | "rpc" | string;

export const generateFeignClientAnnotation = <C extends FeignClientConfiguration, T extends FeignProxyClient<C>>(clientType: FeignClientType) => {

    return (options: FeignClientOptions<C>): Function => {

        /**
         * 创建feign代理的实例
         * @param  {T} clazz
         */
        return (clazz: { new(...args: any[]): {} }): any => {

            /**
             * {@link FeignHttpConfiguration} 的实现类类型
             */
            const feignConfigurationConstructor = options.configuration;

            /**
             * 返回一个实现了 FeignProxyClient 接口的匿名类
             */
            return class extends clazz implements FeignProxyClient<C> {

                private readonly _serviceName: string;

                private readonly _options: FeignClientMemberOptions<C>;

                constructor() {
                    super();

                    const feignOptions: FeignClientMemberOptions<C> = {
                        apiServiceName: options.apiServiceName || DEFAULT_SERVICE_NAME,
                        value: options.value,
                        url: options.url,
                        configuration: undefined
                    };

                    this._serviceName = feignOptions.value || clazz.name;
                    this._options = feignOptions;
                    // build feign client instance
                    return convertFunctionInterface<FeignClientBuilder, FeignClientBuilderInterface<any>>(defaultFeignClientBuilder,"build").build(this, clientType);
                }

                readonly serviceName = () => {
                    return this._serviceName
                };

                readonly options = () => {
                    return this._options;
                };

                readonly configuration = async () => {
                    if (this._options.configuration != null) {
                        return this._options.configuration;
                    }
                    const apiModule = this.options().apiServiceName;
                    const feignConfiguration: any = feignConfigurationConstructor != null ?
                        new feignConfigurationConstructor() : await FeignConfigurationRegistry.getFeignConfiguration<C>(clientType, apiModule);

                    // TODO 某些情况下 feign configuration 未初始化
                    if (feignConfiguration == null) {
                        throw new Error("feign configuration is null or not register");
                    }
                    this._options.configuration = feignConfiguration;
                    return feignConfiguration;
                };

                /**
                 * 获取获取接口方法的配置
                 * @param serviceMethod  服务方法名称
                 */
                public getFeignMethodConfig = (serviceMethod: string): FeignClientMethodConfig => {
                    return getFeignClientMethodConfig(clazz, serviceMethod);
                };
            }
        }
    };
}

/**
 *
 * @param clazz          feign class
 * @param serviceMethodName  方法名称
 */
export const getFeignClientMethodConfig = (clazz, serviceMethodName: string) => {
    return Reflect.getMetadata(FEIGN_CLINE_META_KEY, clazz, serviceMethodName);
};
