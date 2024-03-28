import {HttpRequest} from "../Http";
import {ClientHttpRequestInterceptorInterface} from "../client/ClientHttpRequestInterceptor";
import {HttpMediaType, matchMediaType} from "wind-common-utils/lib/http/HttpMediaType";
import {ApiRequestSinger} from "wind-api-signature";
import {CONTENT_TYPE_HEAD_NAME} from "../HttpConstants";
import URL from "url-parse";
import qs from "querystring";
import {DefaultHttpLo4jFactory} from "../log/HttpLog4jFactory";

const SIGNE_CONTENT_TYPES = [HttpMediaType.FORM_DATA, HttpMediaType.APPLICATION_JSON]

const serializeSignRequestBody = (requestBody: any, contentType: any): string | undefined => {
    if (
        requestBody === null ||
        requestBody === undefined ||
        Object.prototype.toString.call(requestBody) === '[object FormData]'
    ) {
        return undefined;
    }
    if (typeof requestBody === 'string') {
        return requestBody;
    }
    if (matchMediaType(contentType, HttpMediaType.APPLICATION_JSON_UTF8)) {
        // json data
        return JSON.stringify(requestBody);
    }

    if (matchMediaType(contentType, HttpMediaType.FORM_DATA)) {
        // form data
        return qs.stringify(requestBody);
    }

    throw new Error(`unsupported content-type: ${contentType}`);
};
/**
 * Api 签名
 * https://www.yuque.com/suiyuerufeng-akjad/wind/zl1ygpq3pitl00qp
 */
export default class ApiSignatureRequestInterceptor<T extends HttpRequest> implements ClientHttpRequestInterceptorInterface<T> {

    private static readonly LOG = DefaultHttpLo4jFactory.getLogger(ApiSignatureRequestInterceptor.name);

    private readonly signer: ApiRequestSinger;

    constructor(signer: ApiRequestSinger) {
        this.signer = signer;
    }

    intercept = (request: T, context: any, next: any): Promise<any> => {
        const contentType = (request.headers || {})[CONTENT_TYPE_HEAD_NAME];
        const url = new URL(request.url);
        const {headers, debugObject} = this.signer.sign({
            method: request.method as any,
            requestPath: url.pathname,
            requestBody: serializeSignRequestBody(request.body, contentType),
            queryParams: qs.parse(url.query.substring(1))
        });
        request.headers = {...(request.headers || {}), ...headers};
        if (debugObject) {
            ApiSignatureRequestInterceptor.LOG.debug("api sign debug", debugObject);
        }
        return next(request, context);
    }
}