
# Wind-Http
- 一个跨平台的 Http 库

# Quick Started
- 配置 RestTemplate
```typescript
    // 按需替换 HttpAdapter，以 lb:// 开头的路径会在 RoutingClientHttpRequestInterceptor 中替换为真实的地址
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
```