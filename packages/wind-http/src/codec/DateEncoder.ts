import {HttpRequestDataEncoder} from "./HttpRequestDataEncoder";

import {DateConverter, timeStampDateConverter} from './converter/DateConverter';
import {UriVariable} from "../Http";
import {RestfulHttpRequest} from "../rest/RestOperations";


/**
 * encode/format the Date type in the request data or query params
 * Default conversion to timestamp
 */
export default class DateEncoder implements HttpRequestDataEncoder {

    private dateConverter: DateConverter;

    constructor(dateConverter?: DateConverter) {
        this.dateConverter = dateConverter || timeStampDateConverter;
    }

    encode = async (request: RestfulHttpRequest) => {
        request.uriVariables = this.converterDate(request.uriVariables);
        request.body = this.converterDate(request.body as any);
        return request;
    };

    private converterDate = (data: UriVariable): UriVariable | undefined => {
        if (data == null) {
            return;
        }
        const {dateConverter} = this;

        for (const key in data) {
            const val = data[key];
            if (val != null && val.constructor === Date) {
                // converter date type
                data[key] = dateConverter(val as Date);
            }
        }
        return data;
    }

}
