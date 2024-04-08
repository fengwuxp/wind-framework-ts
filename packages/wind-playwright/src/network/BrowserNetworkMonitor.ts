export interface BrowserNetworkMonitor {
    start: () => Promise<void>;

    destroy: () => Promise<void>;
}

export type MonitorHandle<T> = (data: T) => void

