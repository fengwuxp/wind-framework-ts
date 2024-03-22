import {FeignProxyClient} from "../support/FeignProxyClient";
import {FeignClientType, generateFeignClientAnnotation} from "./FeignClientAnnotationFactory";
import {FeignClientConfiguration} from "../configuration/FeignClientConfiguration";


export const FEIGN_HTTP: FeignClientType = "http";

/**
 * Mark a class as feign　client
 * @param options
 * @constructor
 */
export const Feign = generateFeignClientAnnotation<FeignClientConfiguration, FeignProxyClient<FeignClientConfiguration>>(FEIGN_HTTP);