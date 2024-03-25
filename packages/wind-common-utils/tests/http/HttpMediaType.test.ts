import {HttpMediaType, matchMediaType} from "../../src/http/HttpMediaType";


describe("test http media type", () => {


    test("test matchMediaType", async () => {
        expect(matchMediaType(HttpMediaType.FORM_DATA, HttpMediaType.APPLICATION_JSON_UTF8)).toEqual(false)
        expect(matchMediaType(HttpMediaType.APPLICATION_JSON, HttpMediaType.APPLICATION_JSON_UTF8)).toEqual(true)

    }, 10 * 1000);

});