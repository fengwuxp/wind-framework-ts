import * as log4js from "log4js";
import {FeignClientConfiguration, FeignClientConfigurer} from "../../src";
import {
    AuthenticationClientHttpRequestInterceptor,
    AuthenticationToken,
    DEFAULT_SERVICE_NAME,
    DefaultHttpClient,
    HttpMediaType,
    HttpRequest,
    ProcessBarClientHttpRequestInterceptor,
    RefreshTokenAuthenticationStrategy,
    RestTemplate,
    RoutingClientHttpRequestInterceptor,
    TraceClientHttpRequestInterceptor
} from "wind-http";
import MockHttpAdapter from "./MockHttpAdapter";

const logger = log4js.getLogger();
logger.level = 'debug';

export default class MockFeignClientConfigurer implements FeignClientConfigurer {

    build = (): FeignClientConfiguration => {
        const httpClient = new DefaultHttpClient(new MockHttpAdapter(`lb://${DEFAULT_SERVICE_NAME}`, {
            "GET /api/test/v1/user/1": (req) => ({name: "test"})
        }), [
            new TraceClientHttpRequestInterceptor(),
            new ProcessBarClientHttpRequestInterceptor(() => {
                logger.log("show process bar")
                return () => {
                    logger.log("close process bar")
                }
            }, false),
            new RoutingClientHttpRequestInterceptor("https://www.example.com"),
            new AuthenticationClientHttpRequestInterceptor(new RefreshTokenAuthenticationStrategy({
                getToken(request: Readonly<HttpRequest>): Promise<AuthenticationToken> {
                    return Promise.resolve({
                        authorization: "Bearer 1234567890",
                        expireTime: new Date().getTime() + 100000,
                        refreshToken: "",
                        refreshExpireTime: new Date().getTime() + 100000
                    });
                },
                refreshToken(token: AuthenticationToken, request: Readonly<HttpRequest>): Promise<AuthenticationToken> {
                    return Promise.resolve({
                        authorization: "Bearer 1234567890",
                        expireTime: new Date().getTime() + 100000,
                        refreshToken: "",
                        refreshExpireTime: new Date().getTime() + 100000
                    });
                }

            }))
        ], HttpMediaType.APPLICATION_JSON);
        return {
            restTemplate: new RestTemplate(httpClient)
        }
    }
}