import {RestOperations} from "wind-http";
import {RequestURLResolver} from "../resolve/url/RequestURLResolver";
import {RequestHeaderResolver} from "../resolve/header/RequestHeaderResolver";
import {FeignRequestOptions} from "../FeignClient";


export interface FeignClientConfiguration {

    restTemplate: RestOperations;

    requestURLResolver?: RequestURLResolver;

    requestHeaderResolver?: RequestHeaderResolver;

    globalHeaders?: HeadersInit;

    globalOptions?: FeignRequestOptions;
}

export interface FeignClientConfigurer {

    build: () => FeignClientConfiguration;
}