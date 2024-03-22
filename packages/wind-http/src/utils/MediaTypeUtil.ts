import {HttpMediaType} from "../enums/HttpMediaType";
import {CONTENT_TRANSFER_ENCODING_HEAD_NAME, CONTENT_TYPE_HEAD_NAME} from "../HttpConstants";

/**
 * determine if two HttpMediaTypes are the same
 * @param responseMediaType
 * @param expectMediaType
 */
export const matchMediaType = (responseMediaType: HttpMediaType | string, expectMediaType: HttpMediaType | string) => {

    if (responseMediaType == null || expectMediaType == null) {
        return false;
    }

    if (responseMediaType === expectMediaType) {
        return true;
    }
    const [t1] = responseMediaType.split(";");
    const [t2] = expectMediaType.split(";");
    return t1 == t2;
};

export const matchesMediaType = (responseMediaType: HttpMediaType | string, expectMediaTypes: Array<HttpMediaType | string>) => {
    return expectMediaTypes.map(expectMediaType => matchMediaType(responseMediaType, expectMediaType)).find(match => match);
};

export const responseIsJson = (headers: Record<string, string>) => {
    return matchesMediaType(headers[CONTENT_TYPE_HEAD_NAME], [HttpMediaType.APPLICATION_JSON_UTF8, HttpMediaType.TEXT_JSON_UTF8]);
};

export const responseIsText = (headers: Record<string, string>) => {
    return matchesMediaType(headers[CONTENT_TYPE_HEAD_NAME], [HttpMediaType.TEXT, HttpMediaType.HTML]);
};

export const responseIsFile = (headers: Record<string, string>) => {
    if (matchMediaType(headers[CONTENT_TYPE_HEAD_NAME], HttpMediaType.APPLICATION_STREAM)) {
        return true;
    }
    return matchMediaType(headers[CONTENT_TRANSFER_ENCODING_HEAD_NAME], 'binary')
};
