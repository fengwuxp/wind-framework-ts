import {RequestMatcherFactory} from "../src";
import {HttpMethod} from "wind-http";

describe("RequestMatcherFactory  test", () => {

    test("ant path matches", () => {
        const requestRequestMatcher = RequestMatcherFactory.antRequest(["/**"]);
        const url: string = "https://example.com/api/v1/examples";
        expect(requestRequestMatcher.matches({
            url: new URL(url),
            originalUrl: url,
            queryParams: {},
            method: HttpMethod.GET,
            headers: null,
            body: null
        })).toEqual(true)
    })
})