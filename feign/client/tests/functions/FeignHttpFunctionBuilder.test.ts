import * as log4js from "log4js";
import {
    FeignConfigurationRegistry,
    FeignHttpClientPromiseFunction,
    feignHttpFunctionBuilder
} from "../../src";
import {FEIGN_HTTP} from "../../src/annotations/Feign";
import MockFeignClientConfigurer from "../mock/MockFeignClientConfigurer";
import {appendRouteMapping, DEFAULT_SERVICE_NAME, getRealRequestUrl} from "wind-http";

const logger = log4js.getLogger();
logger.level = 'debug';


describe("test functions feign client builder", () => {

    const mockFeignConfiguration = new MockFeignClientConfigurer().build();

    FeignConfigurationRegistry.setFeignConfiguration(FEIGN_HTTP, DEFAULT_SERVICE_NAME, mockFeignConfiguration);
    const functionBuilder = feignHttpFunctionBuilder({value: "/api/test/v1"});

    test("test function build http client", async () => {
        const findById: FeignHttpClientPromiseFunction<{ id: number }, { name: string }> = functionBuilder.get({value: "/user/{id}"});
        const result = await findById({id: 1});
        expect(result).toEqual({name: "test"});
    }, 30 * 1000);

    test("test route uri", () => {
        appendRouteMapping({
            "test1": "http://www.test.com.cn/api",
            "test2": "https://www.test.com.cn/api",
        })
        expect(getRealRequestUrl("lb://test1/users")).toEqual("http://www.test.com.cn/api/users");
        expect(getRealRequestUrl("lb://test2/users")).toEqual("https://www.test.com.cn/api/users");
    })

});

