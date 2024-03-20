import * as log4js from "log4js";
import {
    converterFunctionInterface,
    defaultUriTemplateFunctionHandler,
    DefaultUriTemplateHandler,
    UriTemplateHandler,
    UriTemplateHandlerInterface
} from "../../src";


const logger = log4js.getLogger();
logger.level = 'debug';

describe("template test", () => {

    const defaultUriTemplateHandler: UriTemplateHandler = new DefaultUriTemplateHandler();

    test("path variable", () => {

        const expand1 = defaultUriTemplateFunctionHandler("http://a.b.com/{module}/{id}", ["member", 1]);
        expect(expand1).toEqual("http://a.b.com/member/1");
        const expand2 = defaultUriTemplateFunctionHandler("http://a.b.com/{module}/{id}?name=李四", {
            "module": "member",
            id: 1
        });
        expect(expand2).toEqual("http://a.b.com/member/1?name=李四")
        const expand3 = defaultUriTemplateFunctionHandler("http://a.b.com/member/{id}", [1, "member"]);
        expect(expand3).toEqual("http://a.b.com/member/1?0=member")
    });


    test("query string", () => {
        const expand1 = defaultUriTemplateHandler.expand("http://a.b.com/member", {"id": 1});
        expect(expand1).toEqual("http://a.b.com/member?id=1")
        const expand2 = defaultUriTemplateHandler.expand("http://a.b.com/member?name=张三", {"id": 2});
        expect(expand2).toEqual("http://a.b.com/member?id=2&name=张三")
        const expand3 = defaultUriTemplateHandler.expand("http://a.b.com/member?name=张三", {"id": [1, 2, 3]});
        expect(expand3).toEqual("http://a.b.com/member?id=1&id=2&id=3&name=张三")
    });


    test("path variable and query string", () => {
        const expand1 = defaultUriTemplateHandler.expand("http://a.b.com/member/{id}?age=12&sex=MAN", {
            "id": 1,
            name: "张三"
        });
        expect(expand1).toEqual("http://a.b.com/member/1?name=%E5%BC%A0%E4%B8%89&age=12&sex=MAN")
        const expand2 = defaultUriTemplateHandler.expand("http://a.b.com/member/{id}", {"id": 2, name: "张三"});
        expect(expand2).toEqual("http://a.b.com/member/2?name=%E5%BC%A0%E4%B8%89")
        const expand3 = defaultUriTemplateHandler.expand("http://a.b.com/member?name=张三", {"id": [1, 2, 3]});
        expect(expand3).toEqual("http://a.b.com/member?id=1&id=2&id=3&name=张三")
    });

    test("invoke function Interface ", () => {
        const expand1 = converterFunctionInterface<UriTemplateHandler, UriTemplateHandlerInterface>(defaultUriTemplateHandler).expand("http://a.b.com/member/{id}", {
            "id": 2,
            name: "张三"
        });
        expect(expand1).toEqual("http://a.b.com/member/2?name=%E5%BC%A0%E4%B8%89");
        const expand2 = converterFunctionInterface<UriTemplateHandler, UriTemplateHandlerInterface>(defaultUriTemplateFunctionHandler).expand("http://a.b.com/member/{id}", {
            "id": 2,
            name: "张三"
        });
        expect(expand2).toEqual("http://a.b.com/member/2?name=%E5%BC%A0%E4%B8%89");
    })


});
