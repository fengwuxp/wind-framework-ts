import * as log4js from "log4js";
import RestTemplate from "../../src/template/RestTemplate";
import DefaultHttpClient from "../../src/client/DefaultHttpClient";
import MockHttpAdapter from "../mock/MockHttpAdapter";
import {HttpMediaType} from "../../src/constant/http/HttpMediaType";


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

    const defaultHttpClient = new DefaultHttpClient(
        new MockHttpAdapter("http://a.b.com/api"),
        HttpMediaType.FORM_DATA);

    const restTemplate = new RestTemplate(defaultHttpClient);

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
                    name: "李四"
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
