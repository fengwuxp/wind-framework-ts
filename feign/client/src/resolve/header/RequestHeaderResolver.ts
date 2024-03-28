import {FeignProxyClient} from "../../support/FeignProxyClient";
import {UriVariable} from "wind-http";


/**
 * resolve request header
 */
export type RequestHeaderResolver = (apiService: FeignProxyClient, methodName: string, headers: HeadersInit, data: UriVariable | object) => HeadersInit;

