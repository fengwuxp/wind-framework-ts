import {BusinessResponseExtractorFunction, ResponseExtractor, ResponseExtractorInterface} from "./ResponseExtractor";
import {HttpClient} from "../client/HttpClient";
import {UriTemplateHandler, UriTemplateHandlerInterface} from "./UriTemplateHandler";
import {defaultUriTemplateFunctionHandler} from "./DefaultUriTemplateHandler";
import {ResponseErrorHandler, ResponseErrorHandlerInterFace} from "./ResponseErrorHandler";
import RetryHttpClient from "../client/RetryHttpClient";
import {RestfulHttpRequest, RestOperations} from "./RestOperations";
import {HttpMethod} from "../enums/HttpMethod";
import {HttpRequestContextAttributes, HttpResponse, UriVariable} from "../Http";
import {replacePathVariableValue} from "../utils/UriVariableUtils";
import {
    DEFAULT_BUSINESS_EXTRACTOR,
    headResponseExtractor,
    objectResponseExtractor,
    optionsMethodResponseExtractor
} from "./RestfulResponseExtractor";
import {convertFunctionInterface} from "../utils/ConvertFunctionInterface";
import HttpRequestCodec from "../codec/HttpRequestCodec";

export interface RestTemplateOptions {
    uriTemplateHandler?: UriTemplateHandler;
    responseErrorHandler?: ResponseErrorHandler;
    businessResponseExtractor?: BusinessResponseExtractorFunction;
    codec?: HttpRequestCodec;
}

const DEFAULT_OPTIONS: Partial<RestTemplateOptions> = {
    uriTemplateHandler: defaultUriTemplateFunctionHandler,
    businessResponseExtractor: DEFAULT_BUSINESS_EXTRACTOR,
    codec: new HttpRequestCodec([], [])
}

/**
 * http rest template
 */
export default class RestTemplate implements RestOperations {

    private readonly httpClient: HttpClient;

    private readonly options: RestTemplateOptions;

    constructor(httpClient: HttpClient, options?: RestTemplateOptions) {
        this.httpClient = httpClient;
        this.options = {
            ...DEFAULT_OPTIONS,
            ...(options || {}),
        }
    }

    delete = (url: string, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<void> => {
        return this.exchange({
            method: HttpMethod.DELETE,
            url,
            uriVariables,
            headers
        }, context, objectResponseExtractor);
    };

    getForEntity = <E = any>(url: string, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<HttpResponse<E>> => {
        return this.exchange({
            method: HttpMethod.GET,
            url,
            uriVariables,
            headers
        }, context, null);
    };

    getForObject = <E = any>(url: string, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<E> => {
        return this.exchange({
            method: HttpMethod.GET,
            url,
            uriVariables,
            headers
        }, context, objectResponseExtractor);
    };

    headForHeaders = (url: string, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<Record<string, string>> => {
        return this.exchange({
            method: HttpMethod.HEAD,
            url,
            uriVariables,
            headers
        }, context, headResponseExtractor);
    };

    optionsForAllow = (url: string, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<HttpMethod[]> => {
        return this.exchange({
            method: HttpMethod.OPTIONS,
            url,
            uriVariables,
            headers
        }, context, optionsMethodResponseExtractor);
    };

    patchForObject = <E = any>(url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<E> => {
        return this.exchange({
            method: HttpMethod.PATCH,
            url,
            uriVariables,
            body: requestBody,
            headers
        }, context, objectResponseExtractor);
    };

    postForEntity = <E = any>(url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<HttpResponse<E>> => {
        return this.exchange({
            method: HttpMethod.POST,
            url,
            uriVariables,
            body: requestBody,
            headers
        }, context, null);
    };

    postForLocation = (url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<string> => {
        return this.exchange({
            method: HttpMethod.POST,
            url,
            uriVariables,
            body: requestBody,
            headers
        }, context, objectResponseExtractor);
    };

    postForObject = <E = any>(url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<E> => {
        return this.exchange({
            method: HttpMethod.POST,
            url,
            uriVariables,
            body: requestBody,
            headers
        }, context, objectResponseExtractor);
    };

    put = (url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<void> => {
        return this.exchange({
            method: HttpMethod.PUT,
            url,
            uriVariables,
            body: requestBody,
            headers
        }, context, objectResponseExtractor);
    };

    exchange = async <E = any>(request: RestfulHttpRequest, context?: HttpRequestContextAttributes, responseExtractor?: ResponseExtractor<E>): Promise<E> => {
        if (context == null) {
            context = {};
        }
        // handle url and query params
        const {uriTemplateHandler, responseErrorHandler, businessResponseExtractor, codec} = this.options;
        const newRequest: RestfulHttpRequest = await codec.request(request);

        const {url, method, uriVariables, body, headers} = newRequest;
        // handling path parameters in the request body, if any
        const requestUrl = convertFunctionInterface<UriTemplateHandler, UriTemplateHandlerInterface>(uriTemplateHandler, "expand")
            .expand(replacePathVariableValue(url, body as any), uriVariables);

        let httpClient = this.httpClient;
        if (context.retryOptions != null) {
            // retry client
            httpClient = new RetryHttpClient(httpClient, context.retryOptions);
        }

        let httpResponse: any;
        try {
            httpResponse = await httpClient.send({
                url: requestUrl,
                method,
                body: body,
                headers
            }, context);
        } catch (error) {
            // handle error
            if (responseErrorHandler) {
                return convertFunctionInterface<ResponseErrorHandler, ResponseErrorHandlerInterFace>(responseErrorHandler, "handleError").handleError(
                    {
                        url: requestUrl,
                        method,
                        headers,
                        body: body
                    }, error, context);
            }
            return Promise.reject(error);
        }

        if (responseExtractor) {
            return convertFunctionInterface<ResponseExtractor<E>, ResponseExtractorInterface<E>>(responseExtractor, "extractData").extractData(httpResponse, businessResponseExtractor);
        }
        return codec.response(newRequest, httpResponse);
    };
}
