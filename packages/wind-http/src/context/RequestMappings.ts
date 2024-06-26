import URL from 'url-parse';
import {HTTP_SCHEMA, LB_SCHEMA} from "../HttpConstants";

/**
 * 路由配置
 * @key  模块名称
 * @value  模块对应的接口请求地址
 */
const ROUTE_MAPPINGS: Record<string, string> = {};

const HTTP_URL_REGEX = /^(http:\/\/|https:\/\/)/;
/**
 * 根据 {@see ROUTE_MAPPING} 的配置进行url合并
 * @param url             请求的url  格式 lb://{serviceId}/uri==>  例如：'lb://test-app/api/xxx/test'
 * @param routeMapping    路由配置
 */
const routing = (url: string, routeMapping: Record<string, string>) => {
    if (HTTP_URL_REGEX.test(url)) {
        // uri
        return normalizeUrl(url);
    }

    if (!url.startsWith(LB_SCHEMA)) {
        throw new Error(`illegal routing url -> ${url}`);
    }

    const _url = new URL(url.replace(LB_SCHEMA, HTTP_SCHEMA));
    // TODO 增加负载均衡支持
    const serviceId = _url.host
    const serviceUri = routeMapping[serviceId];
    if (serviceUri.startsWith("/")) {
        return normalizeUrl(`${serviceUri}${_url.pathname}${_url.query}`);
    }
    const routeUri = new URL(serviceUri);
    const [protocol] = routeUri.protocol.split(":");
    const result = normalizeUrl(`${protocol}://${routeUri.host}${routeUri.pathname}${_url.pathname}`);
    if (_url.query) {
        return `${result}${_url.query}`;
    }
    return result;
};


/**
 * Remove duplicate slashes if not preceded by a protocol
 * @param url
 */
const normalizeUrl = (url: string): string => {
    return url.replace(/((?!:).|^)\/{2,}/g, (_, p1) => {
        if (/^(?!\/)/g.test(p1)) {
            return `${p1}/`;
        }
        return '/';
    });
};

/**
 * routing url
 * @param url  example: @default/api/xxx
 */
export const getRealRequestUrl = (url: string) => routing(url, ROUTE_MAPPINGS);

/**
 * 添加路由配置
 * @param routeMapping
 */
export const appendRouteMapping = (routeMapping: Record<string, string>) => {
    for (const key in routeMapping) {
        ROUTE_MAPPINGS[key] = routeMapping[key];
    }
};


