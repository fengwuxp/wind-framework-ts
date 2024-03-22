import * as log4js from "log4js";
import DefaultHttpClient from "../../src/client/DefaultHttpClient"
import RestTemplate from "../../src/rest/RestTemplate"
import MockHttpAdapter from "../mock/MockHttpAdapter";
import {
    AuthenticationClientHttpRequestInterceptor,
    AuthenticationToken,
    DateEncoder,
    DEFAULT_SERVICE_NAME,
    HttpMediaType,
    HttpRequest,
    HttpRequestCodec,
    ProcessBarClientHttpRequestInterceptor,
    RefreshTokenAuthenticationStrategy,
    RoutingClientHttpRequestInterceptor,
    stringDateConverter,
    TraceClientHttpRequestInterceptor
} from "../../src";


const logger = log4js.getLogger();
logger.level = 'debug';


describe("template test", () => {

    const NOT_FOUND_ERROR = {
        "data": undefined,
        "headers": null,
        "ok": false,
        "statusCode": 404,
        "statusText": "Not Found"
    }

    const defaultHttpClient = new DefaultHttpClient(new MockHttpAdapter(`lb://${DEFAULT_SERVICE_NAME}`), [
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

    const restTemplate = new RestTemplate(defaultHttpClient, {
        codec: new HttpRequestCodec([new DateEncoder(stringDateConverter())])
    });

    test("get for object path variable", async () => {

        try {
            const response = await restTemplate.getForObject(
                "http://a.b.com/member/{id}",
                [1],
                {}).then((data) => {
                logger.debug("data", data);
                return data
            });
            expect(response).toEqual({});
        } catch (error) {
            expect(error).toEqual(NOT_FOUND_ERROR);
        }

    }, 10 * 1000);

    test("get for object query string", async () => {
        try {
            const data = await restTemplate.getForObject(
                "http://a.b.com/members",
                {
                    id: 1,
                    name: "李四",
                    beginTime: new Date()
                },
                {}).then((data) => {
                return data;
            });
            expect(data).toEqual({});
        } catch (error) {
            expect(error).toEqual(NOT_FOUND_ERROR);
        }
    }, 10 * 1000);

    test("post for object query string", async () => {

        try {
            const response = await restTemplate.postForEntity(
                "http://a.b.com/members",
                {
                    id: 1,
                    name: "李四",
                    html: ""
                },
                {
                    age: 2
                });
            expect(response).toEqual({});
        } catch (error) {
            expect(error).toEqual(NOT_FOUND_ERROR);
        }

    }, 10 * 1000);
})
;
