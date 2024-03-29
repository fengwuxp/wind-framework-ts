import {
    HttpAdapter,
    HttpRequest,
    HttpRequestContextAttributes,
    HttpResponse,
    responseIsJson,
    responseIsText
} from "wind-http";
import {APIRequestContext, APIResponse} from "playwright-core";


export default class PlaywrightHttpAdapter implements HttpAdapter {

    private readonly apiRequestContext: APIRequestContext;

    constructor(apiRequestContext: APIRequestContext) {
        this.apiRequestContext = apiRequestContext;
    }

    send = (request: HttpRequest, context: HttpRequestContextAttributes): Promise<HttpResponse> => {
        const {apiRequestContext} = this;
        return apiRequestContext[request.method.toLowerCase()](request.url, {
            data: request.body,
            headers: request.headers as any,
            timeout: context.timeout
        }).then(this.convertResponse)
            .catch(this.convertResponse);
    }

    private convertResponse = (response: APIResponse): Promise<HttpResponse> => {
        return this.parseResponse(response).then(responeBody => {
            return {
                data: responeBody,
                headers: response.headers(),
                ok: response.ok(),
                statusText: response.statusText(),
                statusCode: response.status(),
            }
        })
    }

    private parseResponse = (response: APIResponse): Promise<any> => {
        const headers = response.headers();
        if (responseIsJson(headers)) {
            return response.json();
        } else if (responseIsText(headers)) {
            return response.text();
        } else {
            return response.body()
        }
    }

}