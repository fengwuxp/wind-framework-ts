import {ParsedUrlQueryInput} from "querystring";
import {HttpMethod} from "../enums/HttpMethod";
import {HttpMediaType, matchMediaType} from "wind-common-utils/lib/http/HttpMediaType";
import {SupportSerializableBody} from "../Http";

const supportBodyMethods = [HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH];

/**
 * request method is support request body
 * @param method
 */
export const supportRequestBody = (method: HttpMethod | string) => {
    return supportBodyMethods.some(item => item === method);
};

/**
 * serialize http request body for content type
 * @param body
 * @param contentType
 * @param filterNoneValue  filter none value
 */
export const serializeRequestBody = (body: SupportSerializableBody,
                                     contentType: HttpMediaType,
                                     filterNoneValue: boolean = false): string => {

    if (body == null || contentType == null) {
        return body as any
    }

    if (typeof body === "string") {
        return body;
    }

    if (matchMediaType(contentType, HttpMediaType.FORM_DATA)) {
        // form data
        return queryStringify(body as any, filterNoneValue);
    }

    if (matchMediaType(contentType, HttpMediaType.APPLICATION_JSON_UTF8)) {
        // json data
        return JSON.stringify(filterNoneValue ? filterNoneValueAndNewObject(body) : body);
    }

    throw new Error(`unsupported content-type: ${contentType}`);
};


export const filterNoneValueAndNewObject = (body: Record<string, any> | Array<Record<string, any>>) => {
    if (Array.isArray(body)) {
        return body.filter(item => item != null).map(filterNoneValue);
    }
    return filterNoneValue(body);
};

const filterNoneValue = (body: Record<string, any>) => {
    const newData = {};
    for (const key in body) {
        const value = body[key];
        const isFilter = value == null || isNoneNumber(value) || isNoneString(value);
        if (isFilter) {
            continue;
        }
        newData[key] = value;
    }
    return newData;
}

const stringifyPrimitive = function (val) {
    switch (typeof val) {
        case 'string':
            return val;
        case 'boolean':
            return val ? 'true' : 'false';
        case 'number':
            return isFinite(val) ? val : '';
        default:
            return '';
    }
};

const isNoneNumber = (val) => typeof val === "number" && isNaN(val);
const isNoneString = (val) => typeof val === "string" && val.trim().length === 0;

/**
 * assemble the query string
 *
 * @param obj
 * @param filterNoneValue
 * @param sep
 * @param eq
 * @param name
 */
export const queryStringify = (obj: ParsedUrlQueryInput,
                               filterNoneValue: boolean = true,
                               sep?: string,
                               eq?: string,
                               name?: string): string => {
    sep = sep || '&';
    eq = eq || '=';
    if (obj === null) {
        obj = undefined;
    }

    if (typeof obj === 'object') {
        return Object.keys(obj).map(function (key) {
            const value = obj[key];
            if (filterNoneValue) {
                if (value == null) {
                    return;
                }
                if (isNoneNumber(value)) {
                    return;
                }
                if (isNoneString(value)) {
                    return;
                }
            }
            const ks = `${encodeURIComponent(stringifyPrimitive(key))}${eq}`;
            if (Array.isArray(value)) {
                if (value.length == 0) {
                    return;
                }

                //  调整为 a=x1&=a=x2&a=x3
                return (value as Array<any>).map(item => {
                    return `${ks}${item}`;
                }).join(sep);

                // key=1,2,3
                // return `${ks}${value.join(",")}`;

            } else {
                return `${ks}${encodeURIComponent(stringifyPrimitive(value))}`;
            }
        }).filter(val => {
            return val != null;
        }).join(sep);

    }

    if (!name) {
        return '';
    }
    return `${encodeURIComponent(stringifyPrimitive(name))}${eq}${encodeURIComponent(stringifyPrimitive(obj))}`;

};
