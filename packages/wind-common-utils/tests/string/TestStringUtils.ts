import StringUtils from "../../src/string/StringUtils";
import {dateDiffToDays} from "../../src/date/TimeCalculationUtil";
import DateFormatUtils from "../../src/date/DateFormatUtils";


describe("test string utils", () => {


    test("test string utils isJsonString", async () => {
        const result = StringUtils.isJSONString("1876917131");
        expect(result).toEqual(false)

    }, 10 * 1000);


    test("test date", () => {

        const n1 = dateDiffToDays(new Date(), new Date());
        expect(n1).toEqual(0)

        const n2 = dateDiffToDays(DateFormatUtils.parse("2020-05-08 22:43:11"), DateFormatUtils.parse("2020-08-08 22:43:11"));
        expect(n2).toEqual(92)
    })
});