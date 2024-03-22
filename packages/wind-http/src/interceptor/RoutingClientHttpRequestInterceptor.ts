import {DEFAULT_SERVICE_NAME} from "../HttpConstants";
import {appendRouteMapping, getRealRequestUrl} from "../context/RequestMappings";
import {
    ClientHttpRequestExecution,
    ClientHttpRequestInterceptorInterface
} from "../client/ClientHttpRequestInterceptor";
import {HttpRequest, HttpRequestContextAttributes} from "../Http";


/**
 * If the url starts with @xxx, replace 'xxx' with the value of name='xxx' in the routeMapping
 * example url='lb://memberModule/find_member  routeMapping = {memberModule:"http://test.a.b.com/member"} ==> 'http://test.a.b.com/member/find_member'
 */
export default class RoutingClientHttpRequestInterceptor<T extends HttpRequest = HttpRequest> implements ClientHttpRequestInterceptorInterface<T> {

    /**
     * mapping between api module and url
     */
    constructor(routeMapping: Record<string, string> | string) {
        if (typeof routeMapping === "string") {
            const defaultMap: Record<string, string> = {};
            defaultMap[DEFAULT_SERVICE_NAME] = routeMapping;
            routeMapping = defaultMap;
        }
        appendRouteMapping(routeMapping);
    }

    intercept = async (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T>) => {
        return next({
            ...request,
            url: getRealRequestUrl(request.url)
        }, context);
    }

}

