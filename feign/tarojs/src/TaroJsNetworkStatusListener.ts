import {NetworkStatus, NetworkStatusListener, NetworkType} from "wind-http";


/**
 * taro js network status listener
 */
export default class TaroJsNetworkStatusListener implements NetworkStatusListener {

    // taro js module instance
    private readonly taroJs: any

    private readonly prevStatus: Record<'value', NetworkStatus>;

    constructor(taroJs: any) {
        this.taroJs = taroJs;
        this.prevStatus = {
            value: null
        };
    }

    getNetworkStatus = async (): Promise<NetworkStatus> => {
        return this.taroJs.getNetworkType().then((result: { networkType: NetworkType; }) => {
            const networkType = result.networkType as NetworkType;
            if (networkType == null || networkType === NetworkType.NONE) {
                return Promise.reject(null)
            } else {
                return {
                    networkType,
                    isConnected: true
                };
            }
        })
    };

    onChange = (callback: (networkStatus: NetworkStatus, prevStatus?: NetworkStatus) => void) => {
        this.taroJs.onNetworkStatusChange(({isConnected, networkType}) => {
            const status = {
                networkType,
                isConnected
            } as NetworkStatus;
            callback(status, this.prevStatus.value);
            this.prevStatus.value = status
        })
    };

}
