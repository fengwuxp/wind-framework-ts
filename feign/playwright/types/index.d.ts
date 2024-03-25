import { HttpAdapter, HttpRequest, HttpRequestContextAttributes, HttpResponse } from 'wind-http';
import { APIRequestContext } from 'playwright-core';

declare class PlaywrightHttpAdapter implements HttpAdapter {
    private readonly apiRequestContext;
    constructor(apiRequestContext: APIRequestContext);
    send: (request: HttpRequest, context: HttpRequestContextAttributes) => Promise<HttpResponse>;
    private convertResponse;
    private parseResponse;
}

export { PlaywrightHttpAdapter };
