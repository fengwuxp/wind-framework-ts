import {AbstractHttpClient} from "./AbstractHttpClient";
import {HttpClient} from "./HttpClient";
import {HttpRequest, HttpRequestContextAttributes, HttpResponse, HttpRetryOptions} from "../Http";
import {DefaultHttpLo4jFactory} from "../log/HttpLog4jFactory";

/**
 * support retry http client
 * HttpClient with retry, need to be recreated each time you use this client
 */
export default class RetryHttpClient<T extends HttpRequest = HttpRequest> extends AbstractHttpClient<T> {

    private static LOG = DefaultHttpLo4jFactory.getLogger(RetryHttpClient.name);

    private readonly httpClient: HttpClient<T>;

    // retry options
    private readonly retryOptions: HttpRetryOptions;

    // number of retries
    private countRetry: number = 0;

    private retryEnd = false;

    constructor(httpClient: HttpClient<T>, retryOptions: HttpRetryOptions) {
        super();
        this.httpClient = httpClient;
        this.retryOptions = retryOptions;
        if (this.retryOptions.onRetry == null) {
            this.retryOptions.onRetry = this.onRetry;
        }
        if (this.retryOptions.when == null) {
            this.retryOptions.when = this.whenRetry;
        }
    }

    send = (request: T, context?: HttpRequestContextAttributes): Promise<HttpResponse> => {
        const {retryOptions, httpClient} = this;
        const _maxTimeout = retryOptions.maxTimeout;
        return new Promise<HttpResponse>((resolve, reject) => {
            const retries = retryOptions.retries;
            const result: Promise<HttpResponse> = httpClient.send(request, context).catch((response) => {
                // try retry
                RetryHttpClient.LOG.debug("request failure , ready to retry", response);
                return this.tryRetry(request, response);
            });

            // max timeout control
            const timerId = setTimeout(() => {
                this.retryEnd = true;
                reject(new Error(`retry timeout, maxTimeout=${_maxTimeout}, retry count = ${this.countRetry}`));
            }, _maxTimeout + retries * 10);

            result.then(resolve)
                .catch(reject)
                .finally(() => {
                    RetryHttpClient.LOG.debug("clear timeout", timerId);
                    clearTimeout(timerId);
                });
        });
    };


    /**
     * try retry request
     * @param request
     * @param response
     */
    private tryRetry = (request: T, response): Promise<HttpResponse> => {
        const {onRetry, delay, retries, when} = this.retryOptions;
        const _delay = delay + Math.random() * 31;
        return new Promise<HttpResponse>((resolve, reject) => {
            const errorHandle = (resp) => {
                if (this.countRetry === retries) {
                    RetryHttpClient.LOG.debug("request to reach the maximum number of retries", retries);
                    reject(`retry end，count ${retries}`);
                    return
                }
                RetryHttpClient.LOG.debug(`ready to start the ${this.countRetry + 1} retry after ${_delay} milliseconds`, resp);

                setTimeout(() => {
                    if (this.retryEnd) {
                        return;
                    }
                    this.countRetry++;
                    onRetry(request, resp).then(resolve).catch((error) => {
                        if (when(error)) {
                            errorHandle(error);
                        } else {
                            RetryHttpClient.LOG.debug("give up retry ");
                            reject(error);
                        }
                    });
                }, _delay);
            };

            errorHandle(response);
        });
    };


    /**
     * default retry handle
     * @param req
     * @param response
     */
    private onRetry = (req: T, response: HttpResponse): Promise<HttpResponse> => {
        return this.send(req);
    };


    /**
     * whether to retry
     * @param response
     */
    private whenRetry = (response: HttpResponse): boolean => {
        RetryHttpClient.LOG.debug("when retry", response);
        const httpCode = response.statusCode;
        if (httpCode == null) {
            return true;
        }
        // http response code gte 500
        return httpCode >= 500;
    };
}


