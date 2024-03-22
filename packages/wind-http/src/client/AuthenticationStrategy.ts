import {HttpRequest} from "../Http";


/**
 * authentication strategy
 */
export interface AuthenticationStrategy<T extends HttpRequest> {

    authentication: (request: T) => Promise<T>
}


export interface AuthenticationToken {

    /**
     * authorization info
     */
    authorization: string;

    /**
     * token 到期时间，单位：毫秒数
     */
    expireTime: number;

    /**
     * refresh token
     */
    refreshToken?: string;

    /**
     * refresh 到期时间，单位：毫秒数
     * {@see NEVER_REFRESH_TIME}
     */
    refreshExpireTime?: number;

}
