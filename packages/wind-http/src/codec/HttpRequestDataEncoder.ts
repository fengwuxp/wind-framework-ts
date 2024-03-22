import {RestfulHttpRequest} from "../rest/RestOperations";


/**
 *  request data encoder
 */
export interface HttpRequestDataEncoder {


    /**
     * encode
     * @param request
     * @param otherArgs 其他参数
     */
    encode: (request: RestfulHttpRequest) => Promise<RestfulHttpRequest>;

}
