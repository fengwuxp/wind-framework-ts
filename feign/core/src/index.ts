import {FeignClientExecutor} from "./executor/FeignClientExecutor";

export {RequestMapping} from "./annotations/mapping/RequestMapping";
export {GetMapping} from "./annotations/mapping/GetMapping";
export {PostMapping} from "./annotations/mapping/PostMapping";
export {PatchMapping} from "./annotations/mapping/PatchMapping";
export {PutMapping} from "./annotations/mapping/PutMapping";
export {DeleteMapping} from "./annotations/mapping/DeleteMapping";
export {FeignRetry} from "./annotations/retry/FeignRetry";
export {ValidateSchema} from "./annotations/validator/VailidatorSchema";
export {
    generateMapping,
    Mapping,
    BaseRequestMappingOptions,
    MappingHeaders,
    MappingHeaderType,
} from "./annotations/mapping/Mapping";
export {Feign} from "./annotations/Feign";
export {
    generateFeignClientAnnotation, FeignClientOptions, FeignConfigurationConstructor, FeignClientType
} from "./annotations/FeignClientAnnotationFactory";

export {FeignClientConfiguration, FeignClientConfigurer} from "./configuration/FeignClientConfiguration";
export {default as FeignConfigurationRegistry} from "./configuration/FeignConfigurationRegistry";

export {defaultFeignClientBuilder} from "./executor/DefaultFeignClientBuilder";
export {default as DefaultHttpFeignClientExecutor} from "./executor/DefaultHttpFeignClientExecutor";
export {FeignClientExecutor, FeignClientExecutorFactory} from "./executor/FeignClientExecutor";

export {FeignHttpClientFunction, FeignHttpClientPromiseFunction} from "./functions/FeignHttpClientFunction";
export {FeignHttpFunctionBuilder, feignHttpFunctionBuilder} from "./functions/FeignHttpFunctionBuilder";

export {RequestHeaderResolver} from "./resolve/header/RequestHeaderResolver";
export {simpleRequestHeaderResolver} from "./resolve/header/SimpleRequestHeaderResolver";
export {RequestURLResolver} from "./resolve/url/RequestURLResolver";
export {restfulRequestURLResolver} from "./resolve/url/RestFulRequestURLResolver";
export {simpleRequestURLResolver} from "./resolve/url/SimpleRequestURLResolver";

export {FeignClientMethodConfig} from "./support/FeignClientMethodConfig";
export {FeignProxyClient} from "./support/FeignProxyClient";
export {GenerateAnnotationMethodConfig} from "./support/GenerateAnnotationMethodConfig";
export {registerAnnotationMetadata} from "./support/AnnotationMetadataRegister";

export {
    ValidatorDescriptor, ClientRequestDataValidator, ValidateInvokeOptions
} from "./validator/ClientRequestDataValidator";
export {default as AsyncClientRequestDataValidator} from "./validator/AsyncClientRequestDataValidator";
export {default as ClientRequestDataValidatorHolder} from "./validator/ClientRequestDataValidatorHolder";

export {FeignClient, FeignRequestOptions} from "./FeignClient";
export {FEIGN_CLINE_META_KEY} from "./FeignConstants";