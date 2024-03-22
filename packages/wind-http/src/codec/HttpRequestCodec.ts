import {HttpRequestDataEncoder} from "./HttpRequestDataEncoder";
import {HttpResponseDataDecoder} from "./HttpResponseDataDecoder";
import {RestfulHttpRequest} from "../rest/RestOperations";


/**
 * http codec
 */
export default class HttpRequestCodec {

    protected encoders: HttpRequestDataEncoder[];

    protected decoders: HttpResponseDataDecoder[];

    constructor(encoders: HttpRequestDataEncoder[], decoders?: HttpResponseDataDecoder[]) {
        this.encoders = encoders;
        this.decoders = decoders || [];
    }

    response = async <E = any>(request: RestfulHttpRequest, response: E) => {
        const {decoders} = this;
        let result: E = response, len = decoders.length, index = 0;
        while (index < len) {
            const decoder = decoders[index];
            result = await decoder.decode(result);
            index++;
        }
        return result;
    };

    request = async (request: RestfulHttpRequest) => {
        const {encoders} = this;
        let result: RestfulHttpRequest = request, len = encoders.length, index = 0;
        while (index < len) {
            const encoder = encoders[index];
            result = await encoder.encode(result);
            index++;
        }
        return result;
    }

}
