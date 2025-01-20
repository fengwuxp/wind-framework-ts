import NetInfo, {NetInfoState, NetInfoStateType} from "@react-native-community/netinfo";
import {NetworkStatus, NetworkStatusListener, NetworkType} from "wind-http";

/**
 * react-native network status listener
 */
export default class ReactNativeNetworkStatusListener implements NetworkStatusListener {

    private readonly prevStatus: Record<'value', NetworkStatus>;

    constructor() {
        this.prevStatus = {
            value: null
        };
    }

    getNetworkStatus = async (): Promise<NetworkStatus> => {
        const networkState = await NetInfo.fetch();
        const networkStats = this.processNetworkStats(networkState);
        if (networkStats == null) {
            return Promise.reject(networkStats);
        } else {
            return Promise.resolve(networkStats);
        }
    };

    onChange = (callback: (networkStatus: NetworkStatus, prevStatus?: NetworkStatus) => void) => {
        // {"details":{"carrier":"中国移动","cellularGeneration":"4g","isConnectionExpensive":true},"isConnected":true,"isInternetReachable":true,"type":"cellular"}
        NetInfo.addEventListener(state => {
            const status = this.processNetworkStats(state);
            callback(status, this.prevStatus.value);
            this.prevStatus.value = status;
        });
    };

    private processNetworkStats = (networkState: NetInfoState): NetworkStatus => {
        const {type, details} = networkState;
        if (type == null || details == null) {
            return null
        }
        let networkType: NetworkType;
        const {cellularGeneration, isConnectionExpensive} = details as any;
        if (isConnectionExpensive) {
            // 需要付费的网络，例如 移动4G 等
            if (cellularGeneration == null) {
                return null;
            }
            networkType = cellularGeneration;
        } else {
            networkType = this.converterStateType(type);
        }
        if (networkType == null || networkType === NetworkType.NONE) {
            return null
        }

        return {
            // @ts-ignore
            isConnected: networkType !== NetworkType.NONE,
            networkType
        }
    };


    private converterStateType = (type: NetInfoStateType): NetworkType => {
        switch (type) {
            case NetInfoStateType.none:
                return NetworkType.NONE;
            case NetInfoStateType.bluetooth:
            case NetInfoStateType.ethernet:
            case NetInfoStateType.other:
            case NetInfoStateType.unknown:
            case NetInfoStateType.vpn:
            case NetInfoStateType.wimax:
                return NetworkType.UN_KNOWN;
            case NetInfoStateType.cellular:
                return NetworkType["4G"];
            case NetInfoStateType.wifi:
                return NetworkType.WIFI;
            default:
                // throw new Error(`not support network type: ${type}`)
                return null;
        }
    }


}
