import {
    ClientHttpRequestExecution,
    ClientHttpRequestInterceptor,
    ClientHttpRequestInterceptorInterface
} from "../client/ClientHttpRequestInterceptor";
import {MappedInterceptor} from "./MappedInterceptor";
import {HttpRequest, HttpRequestContextAttributes} from "../Http";
import {HttpMethod} from "../enums/HttpMethod";
import {convertClientHttpRequestInterceptor} from "../utils/ConvertFunctionInterface";


/**
 * match interceptor
 */
export default class MappedClientHttpRequestInterceptor<T extends HttpRequest = HttpRequest> extends MappedInterceptor
    implements ClientHttpRequestInterceptorInterface<T> {

    private readonly clientInterceptor: ClientHttpRequestInterceptor<T>;

    constructor(clientInterceptor: ClientHttpRequestInterceptor<T>,
                includePatterns?: string[],
                excludePatterns?: string[],
                includeMethods?: HttpMethod[],
                excludeMethods?: HttpMethod[],
                includeHeaders?: string[][],
                excludeHeaders?: string[][]) {
        super(includePatterns, excludePatterns, includeMethods, excludeMethods, includeHeaders, excludeHeaders);
        this.clientInterceptor = clientInterceptor;

    }


    public intercept = (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T>): Promise<any> => {
        const clientHttpRequestInterceptorInterface = convertClientHttpRequestInterceptor(this.clientInterceptor);
        return clientHttpRequestInterceptorInterface.intercept(request, context, next);
    };


}
