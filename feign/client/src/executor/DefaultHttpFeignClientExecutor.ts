import {FeignClientExecutor} from "./FeignClientExecutor";
import {
    DefaultHttpLo4jFactory,
    filterNoneValueAndNewObject,
    QueryParamType,
    RestfulHttpRequest,
    restfulResponseExtractorFactory,
    supportRequestBody,
    SupportSerializableBody
} from "wind-http";
import {simpleRequestHeaderResolver} from "../resolve/header/SimpleRequestHeaderResolver";
import {restfulRequestURLResolver} from "../resolve/url/RestFulRequestURLResolver";
import {FeignProxyClient} from "../support/FeignProxyClient";
import ClientRequestDataValidatorHolder from "../validator/ClientRequestDataValidatorHolder";
import {FeignRequestOptions} from "../FeignClient";
import {MappingHeaders} from "../annotations/mapping/Mapping";
import qs from "querystring";
import {FeignClientConfiguration} from "../configuration/FeignClientConfiguration";

const DEFAULT_FEIGN_CLIENT_CONFIGURATION: Partial<FeignClientConfiguration> = {
    requestURLResolver: restfulRequestURLResolver,
    requestHeaderResolver: simpleRequestHeaderResolver,
    globalHeaders: {},
    globalOptions: {
        filterNoneValue: true
    }
}

/**
 * default feign client executor
 */
export default class DefaultHttpFeignClientExecutor<T extends FeignProxyClient = FeignProxyClient> implements FeignClientExecutor<T> {

    private static LOG = DefaultHttpLo4jFactory.getLogger(DefaultHttpFeignClientExecutor.name);

    private readonly apiService: T;

    private configuration: FeignClientConfiguration;

    constructor(apiService: T) {
        this.apiService = apiService;
    }

    invoke = async (methodName: string, ...args): Promise<any> => {
        // initialize config
        await this.initialize();

        const {configuration, apiService} = this;
        const {requestURLResolver, restTemplate} = configuration;

        // original parameter
        const originalParameter = args[0] || {};

        // validate request params
        await this.validateRequestParams(originalParameter, methodName);

        // resolver request url
        const requestURL = requestURLResolver(apiService, methodName);
        const options: FeignRequestOptions = args[1] || {};
        const httpRequest = this.buildRestHttpRequest(originalParameter, options, methodName);

        if (DefaultHttpFeignClientExecutor.LOG.isDebugEnabled()) {
            DefaultHttpFeignClientExecutor.LOG.debug(`
                          requestUrl: ${requestURL}
                          request: ${httpRequest}`);
        }
        return restTemplate.exchange({
            ...httpRequest,
            url: requestURL
        } as RestfulHttpRequest, options, restfulResponseExtractorFactory(httpRequest.method))
    };

    /**
     *  init feign client executor
     */
    private initialize = async () => {
        if (this.configuration == null) {
            const feignConfiguration = await this.apiService.configuration<FeignClientConfiguration>();
            this.configuration = {
                ...DEFAULT_FEIGN_CLIENT_CONFIGURATION,
                ...feignConfiguration
            }
        }
    }

    private validateRequestParams = (requestParameter, methodName: string): Promise<void> => {
        const validateSchemaOptions = this.apiService.getFeignMethodConfig(methodName).validateSchemaOptions;
        if (validateSchemaOptions == null) {
            return Promise.resolve();
        }

        // request data validate
        return ClientRequestDataValidatorHolder.validate(requestParameter, validateSchemaOptions).catch(error => {
            // validate error
            DefaultHttpFeignClientExecutor.LOG.debug("validate request params failure, request: %O", requestParameter, error);
            return Promise.reject(error);
        });
    }

    private buildRestHttpRequest = (originalParameter: any, options: FeignRequestOptions, methodName: string): Partial<RestfulHttpRequest> => {
        const {apiService} = this;
        const feignMethodConfig = apiService.getFeignMethodConfig(methodName);
        const {requestMapping} = feignMethodConfig;

        const result: Partial<RestfulHttpRequest> = {
            method: requestMapping.method
        };
        result.headers = this.resolverRequestHeaders(originalParameter, methodName);
        const requestSupportRequestBody = supportRequestBody(requestMapping.method);
        if (requestSupportRequestBody) {
            result.body = this.resolveRequestBody(originalParameter, options.filterNoneValue);
        }
        if (requestMapping.bodyArgName) {
            // 按照指定的名称提交  body 参数
            result.body = result.body[requestMapping.bodyArgName];
        }

        const requiredQuery = requestMapping.queryArgNames && requestMapping.queryArgNames.length > 0;
        if (!requestSupportRequestBody || requiredQuery) {
            // 按照指定的名称提交 url 参数
            if (requiredQuery) {
                const queryArgNames = requestMapping.queryArgNames;
                if (queryArgNames.length == 1 && typeof originalParameter[queryArgNames[0]] === 'object') {
                    // 仅存在一个对象参数
                    result.uriVariables = originalParameter[queryArgNames[0]]
                } else {
                    const uriVariables = {};
                    queryArgNames.forEach(name => {
                        uriVariables[name] = originalParameter[name]
                    });
                    result.uriVariables = this.resolveQueryPrams(uriVariables, requestMapping.params ?? {});
                }
            } else {
                result.uriVariables = this.resolveQueryPrams(originalParameter, requestMapping.params ?? {});
            }
        }
        return result;
    }

    private resolveRequestBody = (originalParameter: any, filterNoneValue: boolean): SupportSerializableBody => {
        if (originalParameter == null) {
            return originalParameter;
        }

        if (Array.isArray(originalParameter)) {
            return filterNoneValue === false ? [...originalParameter] : filterNoneValueAndNewObject(originalParameter);
        }

        // resolver request body，filter none value in request body or copy value
        return filterNoneValue === false ? {...originalParameter} : filterNoneValueAndNewObject(originalParameter);
    }

    private resolveQueryPrams = (queryParams: QueryParamType, requestMappingParams: MappingHeaders | string[]) => {
        return {
            // 合并默认参数
            ...this.resolveRequestMappingParams(requestMappingParams),
            ...(queryParams ?? {}),
        };
    }

    private resolveRequestMappingParams = (requestMappingParams: MappingHeaders | string[]) => {
        if (Array.isArray(requestMappingParams)) {
            return requestMappingParams.map((queryString) => {
                return qs.parse(queryString);
            }).reduce((previousValue, currentValue) => {
                return {
                    ...previousValue,
                    ...currentValue
                }
            }, {});
        }
        return requestMappingParams;
    }

    private resolverRequestHeaders = (originalParameter: Record<string, any>, methodName: string) => {
        const {configuration, apiService} = this;
        const {requestHeaderResolver, globalHeaders} = configuration;
        return {
            ...globalHeaders,
            // resolver headers
            ...requestHeaderResolver(apiService, methodName, {}, originalParameter as object)
        }
    }
}
