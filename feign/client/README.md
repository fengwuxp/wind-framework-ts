# Feign Client

一个声明式的 http 请求工具

# Quick Started

```typescript
export default class MockFeignClientConfigurer implements FeignClientConfigurer {

    build = (): FeignClientConfiguration => {
        // 按需替换 HttpAdapter
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
            restTemplate: new RestTemplate(httpClient, {
                codec: new HttpRequestCodec([new DateEncoder(stringDateConverter())])
            })
        }
    }
}
```

# Http Adapter
- [browser](../browser) 浏览器环境使用，基于 fetch 实现
- [nodejs](../nodejs) nodejs 环境使用，基于 node-fetch 实现
- [react-native](../react-native) react native 适配
- [tarojs](../tarojs) tarojs 适配