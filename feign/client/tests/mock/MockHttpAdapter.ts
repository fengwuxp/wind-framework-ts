import * as log4js from "log4js";
import {
    CONTENT_TYPE_HEAD_NAME,
    HttpAdapter,
    HttpMediaType,
    HttpMethod,
    HttpRequest,
    HttpResponse,
    HttpStatus,
    matchMediaType
} from "wind-http";
import URL from "url-parse";

const logger = log4js.getLogger();
logger.level = 'debug';

export type MockDataSupplier = (options: HttpRequest) => any

const sleep = (times) => {
    return new Promise((resolve) => {
        setTimeout(resolve, times)
    })
};

const resolveHttpResponse = (resp: Response): HttpResponse => {
    if (resp == null) {
        return {
            ok: false,
            headers: {},
            data: null,
            statusCode: -1,
            statusText: "Response is null"
        }
    }
    const {headers, ok, status} = resp;
    return {
        data: resp['data'],
        headers: (headers as any),
        ok,
        statusCode: status,
        statusText: resp["statusText"] || null
    }
};
/**
 * mock http adapter
 */
export default class MockHttpAdapter implements HttpAdapter {

    private readonly mockDataSource: Record<string, MockDataSupplier> = {};

    private readonly baseUrl: string = "";

    //是否启用参数匹配
    // protected enabledParamsPattern: boolean = false;

    constructor(baseUrl: string, mockDataSource?: Record<string, MockDataSupplier>) {
        this.baseUrl = baseUrl;
        this.mockDataSource = mockDataSource ?? {};
    }

    send = async (req: HttpRequest): Promise<HttpResponse> => {
        logger.debug("[MockHttpAdapter] send ", req);
        const {url, method, headers} = req;
        if (matchMediaType(headers[CONTENT_TYPE_HEAD_NAME] as HttpMediaType, HttpMediaType.MULTIPART_FORM_DATA)) {
            // remove content-type
            // @see {@link https://segmentfault.com/a/1190000010205162}
            delete headers[CONTENT_TYPE_HEAD_NAME];
        }

        const result: MockDataSupplier = this.getMockData(method, url);
        const isFailure = result == null;
        if (isFailure) {
            const response: Response = {
                status: HttpStatus.NOT_FOUND,
                statusText: "Not Found",
                ok: false,
                url,
                redirected: null,
                headers: null
            } as any;
            return Promise.reject(resolveHttpResponse(response));
        } else {
            if (method == HttpMethod.HEAD) {
                return Promise.resolve(resolveHttpResponse({
                    status: HttpStatus.OK,
                    ok: true,
                    data: result(req),
                    url,
                    redirected: null,
                    headers: result(req)
                } as any));
            }
            return Promise.resolve(resolveHttpResponse({
                status: HttpStatus.OK,
                ok: true,
                url,
                data: result(req),
                redirected: null,
                headers: null
            } as any));
        }
    };


    /**
     * set mock data
     * @param pattern
     * @param supplier
     */
    setMockData = (pattern: string, supplier: MockDataSupplier) => {
        this.mockDataSource[pattern] = supplier;
    }


    getMockData = (method: string, url: string): MockDataSupplier => {
        let pathname = new URL(url).pathname
        if (!pathname.startsWith("/")) {
            pathname = `/${pathname}`;
        }
        const mockDataSource = this.mockDataSource;
        const key = `${method.toUpperCase()} ${pathname}`;
        return mockDataSource[key];
    }

}
