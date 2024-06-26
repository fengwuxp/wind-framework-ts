import {BusinessResponseExtractorFunction, ResponseExtractor} from "./ResponseExtractor";
import {HttpResponse} from "../Http";
import {HttpMethod} from "../enums/HttpMethod";


/**
 * void response extractor
 * @param response
 */
export const voidResponseExtractor = (response: HttpResponse): Promise<void> => {
    if (response.ok) {
        return Promise.resolve();
    }
    return Promise.reject(response);
};


/**
 * default business response extractor
 *
 * @param responseBody
 * @constructor
 */
export const DEFAULT_BUSINESS_EXTRACTOR: BusinessResponseExtractorFunction = (responseBody) => Promise.resolve(responseBody);

/**
 * object response extractor
 * @param response
 * @param businessResponseExtractor
 */
export const objectResponseExtractor: ResponseExtractor = <E = any>(response: HttpResponse, businessResponseExtractor: BusinessResponseExtractorFunction = DEFAULT_BUSINESS_EXTRACTOR): Promise<E | void> => {
    if (response.ok) {
        if (response.data == null) {
            // none responseBody
            return Promise.resolve();
        }
        return businessResponseExtractor(response.data).catch((data) => {
            response.data = data;
            return Promise.reject(response);
        });
    }
    return Promise.reject(response);
};

/**
 * head response extractor
 * @param response
 */
export const headResponseExtractor = (response: HttpResponse): Promise<Record<string, string>> => {

    return Promise.resolve(response.headers);
};


/**
 * options method response extractor
 * @param response
 */
export const optionsMethodResponseExtractor = (response: HttpResponse): Promise<HttpMethod[]> => {
    if (response.ok) {
        const methods: HttpMethod[] = response.headers["Access-Control-Allow-Methods"].split(",") as HttpMethod[];
        return Promise.resolve(methods);
    }
    return Promise.reject(response);
};

/**
 * 通过 http 请求方法获取一个 ResponseExtractor
 * @param method http method
 */
export const restfulResponseExtractorFactory = (method: HttpMethod) => {
    switch (method) {
        case HttpMethod.GET:
            return objectResponseExtractor;
        case HttpMethod.POST:
            return objectResponseExtractor;
        case HttpMethod.PATCH:
            return objectResponseExtractor;
        case HttpMethod.DELETE:
            return objectResponseExtractor;
        case HttpMethod.OPTIONS:
            return optionsMethodResponseExtractor;
        case HttpMethod.HEAD:
            return headResponseExtractor;
        case HttpMethod.PUT:
            return objectResponseExtractor;
        default:
            throw new Error(`unsupported http method: ${method}`);
    }
};
