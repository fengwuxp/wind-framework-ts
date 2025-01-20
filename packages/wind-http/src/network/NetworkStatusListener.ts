/**
 * Network status listener
 */
export interface NetworkStatusListener {

    /**
     * get network status
     * @return 网络状态
     */
    getNetworkStatus: () => Promise<NetworkStatus>;

    /**
     * @param callback
     */
    onChange: (callback: (status: NetworkStatus, prevStatus?: NetworkStatus) => void) => void;
}

// wifi	    wifi network
// 2g	    2g network
// 3g	    3g network
// 4g	    4g network
// unknown	Android Uncommon network types
// none	    No network
export interface NetworkStatus {

    /**
     * 当前是否有网络连接
     */
    isConnected: boolean;

    /**
     * 网络类型
     */
    networkType: NetworkType;
}

export enum NetworkType {

    WIFI = "wifi",

    "2G" = "2g",

    "3G" = "3g",

    "4G" = "4g",

    "5G" = "5g",

    /**
     * Android 下不常见的网络类型
     */
    UN_KNOWN = "unknown",

    /**
     * 无网络
     */
    NONE = "none",
}

