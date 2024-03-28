import {ApiRequestSinger} from "wind-api-signature";
import {ApiSignatureRequestInterceptor, CONTENT_TYPE_HEAD_NAME, HttpMethod} from "../../src";
import {HttpMediaType} from "wind-common-utils/lib/http/HttpMediaType";


describe("api signature test", () => {
    const singer = ApiRequestSinger.hmacSha256({
        accessId: "example",
        secretKey: "91k23129312o3p12k312"
    }, {headerPrefix: "Wind", debug: true});
    const interceptor = new ApiSignatureRequestInterceptor(singer);

    test("api sign hmacSha256 GET", async () => {
        const {headers} = await interceptor.intercept({
            method: HttpMethod.GET,
            url: "https://example.com/api/v1/users/1?c1=张三&t1=a&a1=1&b2=x91&t1=b",
        }, {}, (r, c) => {
            return r;
        })
        expect(headers["Wind-Access-Id"]).toEqual("example");
    });

    test("api sign hmacSha256 POST", async () => {
        const {headers} = await interceptor.intercept({
            method: HttpMethod.POST,
            headers: {
                [CONTENT_TYPE_HEAD_NAME]: HttpMediaType.APPLICATION_JSON
            },
            body: {
                name: "张三",
                age: 18
            },
            url: "https://example.com/api/v1/users/1?tags=1&z=y&age=27",
        }, {}, (r, c) => {
            return r;
        })
        expect(headers["Wind-Access-Id"]).toEqual("example");
    });
})