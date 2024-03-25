import {HttpMediaType, matchMediaType} from "wind-common-utils/lib/http/HttpMediaType";
import {CONTENT_TRANSFER_ENCODING_HEAD_NAME, CONTENT_TYPE_HEAD_NAME} from "../HttpConstants";


export const matchMediaTypes = (responseMediaType: HttpMediaType | string, expectMediaTypes: Array<HttpMediaType | string>) => {
    return expectMediaTypes.map(expectMediaType => matchMediaType(responseMediaType, expectMediaType)).find(match => match);
};

export const responseIsJson = (headers: Record<string, string>) => {
    return matchMediaTypes(headers[CONTENT_TYPE_HEAD_NAME], [HttpMediaType.APPLICATION_JSON_UTF8, HttpMediaType.TEXT_JSON_UTF8]);
};

export const responseIsText = (headers: Record<string, string>) => {
    return matchMediaTypes(headers[CONTENT_TYPE_HEAD_NAME], [HttpMediaType.TEXT, HttpMediaType.HTML]);
};

export const responseIsFile = (headers: Record<string, string>) => {
    if (matchMediaType(headers[CONTENT_TYPE_HEAD_NAME], HttpMediaType.APPLICATION_STREAM)) {
        return true;
    }
    return matchMediaType(headers[CONTENT_TRANSFER_ENCODING_HEAD_NAME], 'binary')
};
