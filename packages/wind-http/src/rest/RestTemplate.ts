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

/**
 * http rest template
 */
export default class RestTemplate implements RestOperations {

    private readonly httpClient: HttpClient;

    private _uriTemplateHandler: UriTemplateHandler = defaultUriTemplateFunctionHandler;

    private _responseErrorHandler: ResponseErrorHandler;

    private businessResponseExtractor: BusinessResponseExtractorFunction;

    constructor(httpClient: HttpClient, businessResponseExtractor?: BusinessResponseExtractorFunction) {
        this.httpClient = httpClient;
        this.businessResponseExtractor = businessResponseExtractor || DEFAULT_BUSINESS_EXTRACTOR;
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
            requestBody,
            headers
        }, context, objectResponseExtractor);
    };

    postForEntity = <E = any>(url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<HttpResponse<E>> => {
        return this.exchange({
            method: HttpMethod.POST,
            url,
            uriVariables,
            requestBody,
            headers
        }, context, null);
    };

    postForLocation = (url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<string> => {
        return this.exchange({
            method: HttpMethod.POST,
            url,
            uriVariables,
            requestBody,
            headers
        }, context, objectResponseExtractor);
    };

    postForObject = <E = any>(url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<E> => {
        return this.exchange({
            method: HttpMethod.POST,
            url,
            uriVariables,
            requestBody,
            headers
        }, context, objectResponseExtractor);
    };

    put = (url: string, requestBody: any, uriVariables?: UriVariable, headers?: Record<string, string>, context?: HttpRequestContextAttributes): Promise<void> => {
        return this.exchange({
            method: HttpMethod.PUT,
            url,
            uriVariables,
            requestBody,
            headers
        }, context, objectResponseExtractor);
    };

    exchange = async <E = any>(request: RestfulHttpRequest, context?: HttpRequestContextAttributes, responseExtractor?: ResponseExtractor<E>): Promise<E> => {
        const {url, method, uriVariables, requestBody, headers} = request;

        if (context == null) {
            context = {};
        }
        // handle url and query params
        const {_uriTemplateHandler, _responseErrorHandler, businessResponseExtractor} = this;

        // handling path parameters in the request body, if any
        const requestUrl = convertFunctionInterface<UriTemplateHandler, UriTemplateHandlerInterface>(_uriTemplateHandler, "expand")
            .expand(replacePathVariableValue(url, requestBody), uriVariables);

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
                body: requestBody,
                headers
            }, context);
        } catch (error) {
            // handle error
            if (_responseErrorHandler) {
                return convertFunctionInterface<ResponseErrorHandler, ResponseErrorHandlerInterFace>(_responseErrorHandler, "handleError").handleError(
                    {
                        url: requestUrl,
                        method,
                        headers,
                        body: requestBody
                    }, error, context);
            }
            return Promise.reject(error);
        }

        if (responseExtractor) {
            return convertFunctionInterface<ResponseExtractor<E>, ResponseExtractorInterface<E>>(responseExtractor, "extractData").extractData(httpResponse, businessResponseExtractor);
        }

        return httpResponse;
    };

    set uriTemplateHandler(uriTemplateHandler: UriTemplateHandler) {
        this._uriTemplateHandler = uriTemplateHandler;
    }

    set responseErrorHandler(responseErrorHandler: ResponseErrorHandler) {
        this._responseErrorHandler = responseErrorHandler;
    }
}
