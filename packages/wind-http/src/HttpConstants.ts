import {HttpStatus} from "./enums/HttpStatus";

/**
 * http header content type name
 */
export const CONTENT_TYPE_HEAD_NAME = 'Content-Type';

/**
 * http header content length name
 */
export const CONTENT_LENGTH_HEAD_NAME = "Content-Length";

/**
 * http header content transfer encoding name
 */
export const CONTENT_TRANSFER_ENCODING_HEAD_NAME = 'Content-Transfer-Encoding';


/**
 * default api service name
 */
export const DEFAULT_SERVICE_NAME = "default";

export const LB_SCHEMA = "lb://"

export const HTTP_SCHEMA = "http://"

export const HTTPS_SCHEMA = "https://"


/**
 * mock unauthorized response
 */
export const UNAUTHORIZED_RESPONSE = {
    ok: false,
    statusCode: HttpStatus.UNAUTHORIZED,
    statusText: "Unauthorized 401",
};