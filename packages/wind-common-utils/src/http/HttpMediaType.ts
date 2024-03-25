/**
 * http media type
 */
export enum HttpMediaType {

    /**
     * 表单
     */
    FORM_DATA = "application/x-www-form-urlencoded",

    /**
     * 文件表单
     */
    MULTIPART_FORM_DATA = "multipart/form-data",

    /**
     * json
     */
    APPLICATION_JSON = "application/json",

    /**
     * JSON_UTF_8
     */
    APPLICATION_JSON_UTF8 = "application/json;charset=UTF-8",

    /**
     * @deprecated
     */
    TEXT_JSON_UTF8 = "text/json;charset=UTF-8",

    TEXT = "text/plain",

    HTML = "text/html",

    /**
     * 流
     */
    APPLICATION_STREAM = "application/octet-stream"
}


/**
 * determine if two HttpMediaTypes are the same
 *
 * @param responseMediaType
 * @param expectMediaType
 * @return true if the two HttpMediaTypes are the same
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
