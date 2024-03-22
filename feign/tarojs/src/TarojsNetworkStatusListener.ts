import {NetworkStatus, NetworkStatusListener, NetworkType} from "wind-http";


/**
 * tarojs network status listener
 */
export default class TarojsNetworkStatusListener implements NetworkStatusListener {

    // tarojs module instance
    private readonly Taro: any

    constructor(Taro: any) {
        this.Taro = Taro;
    }

    getNetworkStatus = (): Promise<NetworkStatus> => {
        return this.Taro.getNetworkType().then((result) => {
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

    onChange = (callback: (networkStatus: NetworkStatus) => void) => {
        this.Taro.onNetworkStatusChange(({isConnected, networkType}) => {
            callback({
                networkType,
                isConnected
            } as NetworkStatus)
        })
    };

}
