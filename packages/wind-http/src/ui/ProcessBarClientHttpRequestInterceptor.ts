import {HttpRequest, HttpRequestContextAttributes} from "../Http";
import {
    ClientHttpRequestExecution,
    ClientHttpRequestInterceptorInterface
} from "../client/ClientHttpRequestInterceptor";
import {CloseRequestProgressBarFunction, RequestProgressBarFunction} from "./RequestProgressBar";


/**
 * process bar client http request interceptor
 */
export default class ProcessBarClientHttpRequestInterceptor<T extends HttpRequest> implements ClientHttpRequestInterceptorInterface<T> {

    /**
     * 进度条
     */
    private readonly progressBar: RequestProgressBarFunction;

    /**
     * 防止抖动，在接口很快响应的时候，不显示进度条
     */
    private readonly preventJitter: boolean;

    /**
     * 进度条计数器，用于在同时发起多个请求时，
     * 统一控制加载进度条
     */
    private count: number = 0;

    /**
     * 当前执行的定时器
     */
    private timerId;

    /**
     * 关闭 request progress bar fn
     */
    private closeRequestProgressBarFunction: CloseRequestProgressBarFunction;

    constructor(progressBar: RequestProgressBarFunction, preventJitter: boolean = true) {
        this.progressBar = progressBar;
        this.preventJitter = preventJitter;
    }

    intercept = async (request: T, context: HttpRequestContextAttributes, next: ClientHttpRequestExecution<T>): Promise<any> => {
        const requiredShowProcessBar = context.showProcessBar !== false;
        if (requiredShowProcessBar) {
            if (this.count === 0) {
                this.showProgressBar();
            }
            // 计数器加一
            this.count++;
        }
        try {
            return next(request, context);
        } finally {
            if (requiredShowProcessBar) {
                // 计数器减一
                this.count--;
                if (this.count === 0) {
                    this.closeRequestProgressBar();
                }
            }
        }
    }

    private showProgressBar() {
        // 显示加载进度条
        if (this.preventJitter) {
            this.timerId = setTimeout(this.showRequestProgressBar, 300);
        } else {
            this.showRequestProgressBar();
        }
    }

    private showRequestProgressBar = () => {
        const {progressBar} = this;
        this.closeRequestProgressBarFunction = progressBar();
    }

    private closeRequestProgressBar = () => {
        //清除定时器
        clearTimeout(this.timerId);
        const {closeRequestProgressBarFunction} = this;
        // 隐藏加载进度条
        closeRequestProgressBarFunction && closeRequestProgressBarFunction();
    }
}
