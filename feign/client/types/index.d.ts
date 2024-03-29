import { HttpMethod, HttpRequestContextAttributes, HttpRetryOptions, UriVariable, RestOperations } from 'wind-http';
import { RuleItem } from 'async-validator';

type MappingMethod = HttpMethod | string;
type MappingHeaderType = Array<boolean | string | number | Date>;
/**
 * query params type
 */
type MappingHeaders = Record<string, string> | Record<string, boolean | number | string | Date | MappingHeaderType>;
interface BaseRequestMappingOptions {
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
}
interface RequestMappingOptions extends BaseRequestMappingOptions {
    /**
     * 请求 method
     */
    method: HttpMethod;
}
/**
 * url mapping 类型
 */
type Mapping<T extends BaseRequestMappingOptions = BaseRequestMappingOptions> = (options: T) => Function;
/**
 * 生成 Mapping 注解 的方法
 * @param method
 */
declare function generateMapping<T extends BaseRequestMappingOptions>(method?: MappingMethod): Mapping<T>;

declare const RequestMapping: Mapping<RequestMappingOptions>;

/**
 * GetMapping
 */
declare const GetMapping: Mapping<BaseRequestMappingOptions>;

/**
 * PostMapping
 */
declare const PostMapping: Mapping<BaseRequestMappingOptions>;

/**
 * PatchMapping
 */
declare const PatchMapping: Mapping<BaseRequestMappingOptions>;

/**
 * PutMapping
 */
declare const PutMapping: Mapping<BaseRequestMappingOptions>;

/**
 * DeleteMapping
 */
declare const DeleteMapping: Mapping<BaseRequestMappingOptions>;

/**
 *  mark interface
 *  feign client
 */
interface FeignClient {
}
interface FeignRequestOptions extends HttpRequestContextAttributes {
    /**
     * 是否过滤提交数据中的 空字符串，null的数据，数值类型的NaN
     * 默认：false
     * 全局开启可以通过 {@link FeignClientConfiguration#globalOptions}
     */
    filterNoneValue?: boolean;
}

/**
 * 请求重试
 * @param options
 * @constructor
 */
declare const FeignRetry: <T extends FeignClient>(options: HttpRetryOptions) => Function;

type ValidatorDescriptorAll<T> = {
    [key in keyof T]: RuleItem;
};
type ValidatorDescriptor<T> = Partial<ValidatorDescriptorAll<T>>;
interface ValidateInvokeOptions {
    /**
     * default true
     */
    useToast?: boolean;
}
/**
 * request data validator
 */
interface ClientRequestDataValidator {
    /**
     *
     * @param requestData  validate data source
     * @param descriptor   validate rule desc
     * @param options      invoke options
     */
    validate: <T>(requestData: T, descriptor: ValidatorDescriptor<T>, options?: ValidateInvokeOptions | false) => Promise<T>;
}

/**
 * 需要自动上传配置
 */
type ValidateSchemaOptions<T> = ValidatorDescriptor<T>;
/**
 * @param options  验证配置
 * @constructor
 */
declare const ValidateSchema: <O = any, T extends FeignClient = FeignClient>(options: Partial<{ [key in keyof O]: RuleItem; }>) => Function;

/**
 * feign的代理相关配置
 */
interface FeignClientMethodConfig {
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

/**
 * 解析url
 * @param apiService  接口服务
 * @param methodName  服务方法名称
 */
type RequestURLResolver = (apiService: FeignProxyClient, methodName: string) => string;

/**
 * resolve request header
 */
type RequestHeaderResolver = (apiService: FeignProxyClient, methodName: string, headers: HeadersInit, data: UriVariable | object) => HeadersInit;

interface FeignClientConfiguration {
    restTemplate: RestOperations;
    requestURLResolver?: RequestURLResolver;
    requestHeaderResolver?: RequestHeaderResolver;
    globalHeaders?: HeadersInit;
    globalOptions?: FeignRequestOptions;
}
interface FeignClientConfigurer {
    build: () => FeignClientConfiguration;
}

interface BaseFeignClientOptions {
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
interface FeignClientMemberOptions<C extends FeignClientConfiguration> extends BaseFeignClientOptions {
    /**
     * feign configuration
     */
    configuration?: C;
}
/**
 * feign proxy client
 */
interface FeignProxyClient<C extends FeignClientConfiguration = FeignClientConfiguration> extends FeignClient {
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

type FeignConfigurationConstructor<C extends FeignClientConfiguration = FeignClientConfiguration> = {
    new (...args: any[]): C;
};
interface FeignClientOptions<C extends FeignClientConfiguration> extends BaseFeignClientOptions {
    /**
     * feign configuration
     */
    configuration?: FeignConfigurationConstructor<C>;
}
type FeignClientType = "http" | "ws" | "rpc" | string;
declare const generateFeignClientAnnotation: <C extends FeignClientConfiguration, T extends FeignProxyClient<C>>(clientType: FeignClientType) => (options: FeignClientOptions<C>) => Function;

/**
 * Mark a class as feign　client
 * @param options
 * @constructor
 */
declare const Feign: (options: FeignClientOptions<FeignClientConfiguration>) => Function;

/**
 * feign client executor
 */
interface FeignClientExecutor<T extends FeignClient = FeignProxyClient, R = Promise<any>> {
    /**
     * execute proxy service method
     * @param methodName   method name
     * @param args  method params
     */
    invoke: (methodName: string, ...args: any) => R;
}
type FeignClientExecutorFactory<T extends FeignClient = FeignProxyClient> = (client: T) => FeignClientExecutor;

declare const registry: {
    setFeignConfiguration(type: FeignClientType, apiServiceName: string, configuration: any): void;
    getFeignConfiguration<C extends FeignClientConfiguration = FeignClientConfiguration>(type: FeignClientType, apiServiceName: string): Promise<Readonly<C>>;
    registerFeignClientExecutorFactory(type: FeignClientType, factory: FeignClientExecutorFactory): void;
    getFeignClientExecutorFactory(type: FeignClientType): FeignClientExecutorFactory;
};

type FeignClientBuilderFunction<T extends FeignProxyClient = FeignProxyClient> = (client: T, clientType: FeignClientType) => T;

declare const defaultFeignClientBuilder: FeignClientBuilderFunction;

/**
 * default feign client executor
 */
declare class DefaultHttpFeignClientExecutor<T extends FeignProxyClient = FeignProxyClient> implements FeignClientExecutor<T> {
    private static LOG;
    private readonly apiService;
    private configuration;
    constructor(apiService: T);
    invoke: (methodName: string, ...args: any[]) => Promise<any>;
    /**
     *  init feign client executor
     */
    private initialize;
    private validateRequestParams;
    private buildRestHttpRequest;
    private resolveRequestBody;
    private resolveQueryPrams;
    private resolveRequestMappingParams;
    private resolverRequestHeaders;
}

type FeignHttpClientFunction<T, R> = (req: T | undefined, options?: FeignRequestOptions) => R;
type FeignHttpClientPromiseFunction<T, R = any> = FeignHttpClientFunction<T, Promise<R>>;

interface FeignHttpFunctionBuilder {
    request: <T, R>(requestMapping: RequestMappingOptions) => FeignHttpClientFunction<T, R>;
    get: <T, R>(mapping: BaseRequestMappingOptions) => FeignHttpClientFunction<T, R>;
    post: <T, R>(mapping: BaseRequestMappingOptions) => FeignHttpClientFunction<T, R>;
    put: <T, R>(mapping: BaseRequestMappingOptions) => FeignHttpClientFunction<T, R>;
    delete: <T, R>(mapping: BaseRequestMappingOptions) => FeignHttpClientFunction<T, R>;
    patch: <T, R>(mapping: BaseRequestMappingOptions) => FeignHttpClientFunction<T, R>;
    head: <T, R>(mapping: BaseRequestMappingOptions) => FeignHttpClientFunction<T, R>;
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
declare const feignHttpFunctionBuilder: (options: FeignClientOptions<FeignClientConfiguration>) => FeignHttpFunctionBuilder;

declare enum QueryType {
    /**
     * 查询总数
     */
    COUNT_TOTAL = "COUNT_TOTAL",
    /**
     * 查询结果集
     */
    QUERY_RESET = "QUERY_RESET",
    /**
     * 查询总数和结果集
     */
    QUERY_BOTH = "QUERY_RESET"
}
declare enum QueryOrderType {
    /**
     * 升序
     */
    ASC = "ASC",
    DESC = "DESC"
}
/**
 * 默认的排序字段名称
 */
declare enum DefaultOrderField {
    /**
     * 创建时间
     */
    GMT_CREATE = "GMT_CREATE",
    /**
     * 更新时间
     */
    GMT_MODIFIED = "GMT_MODIFIED",
    /**
     * 排序
     */
    ORDER_INDEX = "ORDER_INDEX"
}
interface AbstractPageQuery<F = DefaultOrderField> {
    queryPage?: number;
    querySize?: number;
    queryType?: QueryType;
    /**
     * 排序字段
     */
    orderFields?: F[];
    /**
     * 排序类型
     */
    orderTypes?: QueryOrderType[];
}
/**
 * 分页对象
 */
interface Pagination<T> {
    total: number;
    records: T[];
    queryPage: number;
    querySize: number;
    queryType: QueryType;
}
interface ApiResponse<T> {
    data?: T;
    success: boolean;
    errorCode: string;
    errorMessage?: string;
    traceId: string;
}

/**
 * 简单的请求头解析者
 * 通过服务接口实例和服务方法名称以及注解的配置生成请求头
 */
declare const simpleRequestHeaderResolver: RequestHeaderResolver;

/**
 * restful request url resolver
 * @param apiService
 * @param methodName
 */
declare const restfulRequestURLResolver: RequestURLResolver;

/**
 * 简单的url解析者
 * 通过服务接口实例和服务方法名称以及注解的配置生成url
 */
declare const simpleRequestURLResolver: RequestURLResolver;

/**
 * 根据annotation生成代理服务方法的配置
 */
type GenerateAnnotationMethodConfig<T extends FeignClient = FeignClient, O extends FeignClientMethodConfig = FeignClientMethodConfig> = (targetService: T, methodName: string, options: O) => void;

/**
 * 注册注解（装饰器）元数据
 * @param targetService
 * @param methodName
 * @param options
 */
declare const registerAnnotationMetadata: GenerateAnnotationMethodConfig;

declare class AsyncClientRequestDataValidator implements ClientRequestDataValidator {
    validate: <T>(requestData: T, descriptor: Partial<{ [key in keyof T]: RuleItem; }>, options?: ValidateInvokeOptions | false) => Promise<T>;
}

declare class ClientRequestDataValidatorHolder {
    private static clientRequestDataValidator;
    static setClientRequestDataValidator: (clientRequestDataValidator: ClientRequestDataValidator) => void;
    static validate: <T>(requestData: T, descriptor: Partial<{ [key in keyof T]: RuleItem; }>, options?: ValidateInvokeOptions | false) => Promise<T>;
}

/**
 * feign client metadata key
 */
declare const FEIGN_CLINE_META_KEY = "FEIGN";

export { AbstractPageQuery, ApiResponse, AsyncClientRequestDataValidator, BaseRequestMappingOptions, ClientRequestDataValidator, ClientRequestDataValidatorHolder, DefaultHttpFeignClientExecutor, DefaultOrderField, DeleteMapping, FEIGN_CLINE_META_KEY, Feign, FeignClient, FeignClientConfiguration, FeignClientConfigurer, FeignClientExecutor, FeignClientExecutorFactory, FeignClientMethodConfig, FeignClientOptions, FeignClientType, FeignConfigurationConstructor, registry as FeignConfigurationRegistry, FeignHttpClientFunction, FeignHttpClientPromiseFunction, FeignHttpFunctionBuilder, FeignProxyClient, FeignRequestOptions, FeignRetry, GenerateAnnotationMethodConfig, GetMapping, Mapping, MappingHeaderType, MappingHeaders, Pagination, PatchMapping, PostMapping, PutMapping, QueryOrderType, QueryType, RequestHeaderResolver, RequestMapping, RequestURLResolver, ValidateInvokeOptions, ValidateSchema, ValidatorDescriptor, defaultFeignClientBuilder, feignHttpFunctionBuilder, generateFeignClientAnnotation, generateMapping, registerAnnotationMetadata, restfulRequestURLResolver, simpleRequestHeaderResolver, simpleRequestURLResolver };
