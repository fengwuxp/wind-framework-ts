import {
    DeleteMapping,
    Feign,
    FeignRequestOptions,
    FeignRetry,
    GetMapping,
    PostMapping,
    RequestMapping,
    ValidateSchema
} from "../src";
import {HttpMediaType, HttpMethod} from "wind-http";


type FindMemberRequest = {
    name: string,
    userName: string,
    memberId: number,
    time: Date
};

@Feign({
    value: "/test",
})
export default class ExampleFeignClient {


    @GetMapping({
        value: "/example"
    })
    getExample: (request: {
        id: number,
        test: string,
        date: Date
    }, options?: FeignRequestOptions) => Promise<any>;

    @RequestMapping({
        value: "//testQuery",
        method: HttpMethod.POST,
        headers: {}
    })

    @FeignRetry({
        retries: 5,
        delay: 2000,
        maxTimeout: 9 * 1000
    })
    testQuery: (evt: any, options?: FeignRequestOptions) => Promise<any>;


    @PostMapping({
        value: "find_member/{name}",
        headers: {myHeader: "tk_{memberId}"},
        produces: [HttpMediaType.APPLICATION_JSON_UTF8]
    })
    @ValidateSchema<FindMemberRequest>({
        memberId: {
            required: true,
            min: 1
        }
    })
    findMember: (
        request: FindMemberRequest,
        options?: FeignRequestOptions) => Promise<any>;

    @DeleteMapping({value: "delete_member/{memberId}", produces: [HttpMediaType.APPLICATION_JSON_UTF8]})
    deleteMember: (
        request: { memberId: number },
        options?: FeignRequestOptions) => Promise<number>;

    @PostMapping({
        value: "test-example",
        headers: {myHeader: "tk_{memberId}"},
        produces: [HttpMediaType.APPLICATION_JSON_UTF8],
        bodyArgs: ["tags"]
    })
    testExample2: (
        request: { memberId: number, tags: string[] },
        options?: FeignRequestOptions) => Promise<number>;
}

