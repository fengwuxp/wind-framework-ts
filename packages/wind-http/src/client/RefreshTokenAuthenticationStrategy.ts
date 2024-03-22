import {AuthenticationStrategy, AuthenticationToken} from "./AuthenticationStrategy";
import {HttpRequest} from "../Http";
import {UNAUTHORIZED_RESPONSE} from "../HttpConstants";


export interface RefreshTokenAuthenticationOptions {

    /**
     * 获取 token
     * @param request
     */
    getToken: (request: Readonly<HttpRequest>) => Promise<AuthenticationToken>;

    /**
     * 刷新 token
     * @param request
     */
    refreshToken: (token: AuthenticationToken, request: Readonly<HttpRequest>) => Promise<AuthenticationToken>;

    /**
     * 添加 authorization header
     * @param authorization
     * @param request
     */
    appendAuthorizationHeader?: (authorization: AuthenticationToken, request: HttpRequest) => HttpRequest;

    /**
     * Synchronous blocking 'authorization' refresh
     * default: true
     */
    synchronousRefreshAuthorization?: boolean;

    /**
     * Refresh tokens 5 minutes in advance by default
     * default: 5min
     */
    aheadOfTimes?: number;
}

const DEFAULT_AUTHENTICATION_HEADER_NAME = "Authorization";

const DEFAULT_OPTIONS: Partial<RefreshTokenAuthenticationOptions> = {
    synchronousRefreshAuthorization: true,
    aheadOfTimes: 5 * 60 * 1000,
    appendAuthorizationHeader: (authorization, request) => {
        request.headers[DEFAULT_AUTHENTICATION_HEADER_NAME] = authorization.authorization
        return request;
    }
}

/**
 * Refresh token authentication strategy
 */
export class RefreshTokenAuthenticationStrategy implements AuthenticationStrategy<HttpRequest> {

    private readonly options: RefreshTokenAuthenticationOptions;

    // wait refresh token request queue
    private waitRequestQueue: Array<{
        resolve: (value?: any | PromiseLike<any>) => void;
        reject: (reason?: any) => void
    }> = [];

    // is refreshing status
    private refreshing = false;

    constructor(options: RefreshTokenAuthenticationOptions) {
        this.options = {
            ...options,
            ...DEFAULT_OPTIONS,
        };
    }

    authentication = async (request: HttpRequest): Promise<HttpRequest> => {
        const {getToken, aheadOfTimes, appendAuthorizationHeader} = this.options;
        let token: AuthenticationToken
        try {
            token = await getToken(request);
        } catch (e) {
            return Promise.reject({
                ...UNAUTHORIZED_RESPONSE,
                data: e
            });
        }
        const expireTimes = new Date().getTime() + aheadOfTimes;
        if (token.expireTime <= expireTimes) {
            // token expired
            const refreshTokenEffective = (token.expireTime ?? token.expireTime) > expireTimes;
            if (refreshTokenEffective) {
                // refresh token
                token = await this.refreshToken(request, token);
            }
        }
        return appendAuthorizationHeader(token, request);
    }

    private refreshToken = async (request: HttpRequest, refreshToken: AuthenticationToken): Promise<AuthenticationToken> => {
        const {synchronousRefreshAuthorization} = this.options;
        if (synchronousRefreshAuthorization) {
            return this.syncRefreshToken(request, refreshToken);
        } else {
            // For asynchronous refresh, the server needs to support multiple tokens
            return this.refreshToken0(request, refreshToken);
        }
    }

    private syncRefreshToken = async (req: HttpRequest, refreshToken): Promise<AuthenticationToken> => {
        // Block other requests if you are refreshing token
        if (this.refreshing) {
            // join wait queue
            return new Promise<AuthenticationToken>((resolve, reject) => {
                this.waitRequestQueue.push({
                    resolve,
                    reject,
                });
            });
        } else {
            // Synchronous refresh
            this.refreshing = true;
            // need refresh token
            let authenticationToken: AuthenticationToken, error: any
            try {
                authenticationToken = await this.refreshToken0(req, refreshToken);
            } catch (e) {
                error = e;
            }
            this.completeWaitQueue(authenticationToken, error);
            this.refreshing = false;
            return authenticationToken;
        }
    }

    private completeWaitQueue(authenticationToken: AuthenticationToken, error: any) {
        const waitRequestQueue = [...this.waitRequestQueue];
        // clear
        this.waitRequestQueue = [];
        waitRequestQueue.forEach(({reject, resolve}) => {
            if (authenticationToken != null) {
                resolve(authenticationToken);
            } else {
                reject(error);
            }
        });
    }

    private refreshToken0 = async (request: HttpRequest, refreshToken: AuthenticationToken): Promise<AuthenticationToken> => {
        // Concurrent refresh
        try {
            return this.options.refreshToken(refreshToken, request);
        } catch (error) {
            // refresh authorization error
            return Promise.reject({
                ...UNAUTHORIZED_RESPONSE,
                data: error
            });
        }
    }

}