import memoize from "lodash/memoize";
import {FeignClientType} from "../annotations/FeignClientAnnotationFactory";
import DefaultHttpFeignClientExecutor from "../executor/DefaultHttpFeignClientExecutor";
import {FeignClientExecutorFactory} from "../executor/FeignClientExecutor";
import {FeignClientConfiguration} from "./FeignClientConfiguration";


// ignore memorization method names
const ignoreMethodNames = new Set<string>(["getFeignClientExecutor"]);

/**
 * configuration function wrapper caches
 * @param configuration
 */
const memorizationConfiguration = (configuration: FeignClientConfiguration): FeignClientConfiguration => {
    if (configuration == null) {
        return;
    }
    const newConfiguration: any = {};
    for (const key in configuration) {
        const configurationElement = configuration[key];
        const needMemoize = ignoreMethodNames.has(key) && typeof configurationElement === "function";
        if (needMemoize) {
            newConfiguration[key] = memoize(configurationElement, () => configurationElement);
        } else {
            newConfiguration[key] = configurationElement;
        }
    }
    return newConfiguration;
};


type WaitQueue = {
    [key: string]: Array<(handle: (val: FeignClientConfiguration) => void) => void>
};

/**
 * 等待获取配置队列
 *
 */
const WAIT_GET_CONFIGURATION_QUEUE: Record<FeignClientType, WaitQueue> = {};

const getWaitConfigurationQueue = (type: FeignClientType, apiModule: string): Array<Function> => {
    if (WAIT_GET_CONFIGURATION_QUEUE[type] == null) {
        WAIT_GET_CONFIGURATION_QUEUE[type] = {};
    }
    return WAIT_GET_CONFIGURATION_QUEUE[type][apiModule];
}

const initWaitConfigurationQueue = (type: FeignClientType, apiModule: string) => {
    if (WAIT_GET_CONFIGURATION_QUEUE[type] == null) {
        WAIT_GET_CONFIGURATION_QUEUE[type] = {};
    }
    WAIT_GET_CONFIGURATION_QUEUE[type][apiModule] = [];
}


/**
 * @key type
 * @value {
 *     key: apiModule
 *     value：FeignConfiguration
 * }
 */
const CONFIGURATION_CACHES: Record<FeignClientType, Record<string, any>> = {};

const getConfigurationCaches = <C extends FeignClientConfiguration>(type: FeignClientType): Record<string, C> => {
    if (CONFIGURATION_CACHES[type] == null) {
        CONFIGURATION_CACHES[type] = {};
    }
    return CONFIGURATION_CACHES[type];
}

const notInitFactory = (type: FeignClientType) => {
    return client => {
        throw new Error(`${type} feign client not init`);
    }
}

/**
 * feign executor factory
 */
const FEIGN_CLIENT_EXECUTOR_FACTORIES: Record<FeignClientType, FeignClientExecutorFactory> = {
    http: client => new DefaultHttpFeignClientExecutor(client),
    ws: notInitFactory("ws"),
    rpc: notInitFactory("rpc")
};

const registry = {

    setFeignConfiguration(type: FeignClientType, apiServiceName: string, configuration: any) {
        getConfigurationCaches(type)[apiServiceName] = memorizationConfiguration(configuration);
        const waitQueue = getWaitConfigurationQueue(type, apiServiceName);
        if (getWaitConfigurationQueue(type, apiServiceName)?.length > 0) {
            waitQueue.forEach(fn => fn(configuration));
            // clear
            initWaitConfigurationQueue(type, apiServiceName);
        }
    },

    getFeignConfiguration<C extends FeignClientConfiguration = FeignClientConfiguration>(type: FeignClientType, apiServiceName: string): Promise<Readonly<C>> {
        const configuration = getConfigurationCaches<C>(type)[apiServiceName];
        if (configuration != null) {
            return Promise.resolve(configuration);
        }
        if (getWaitConfigurationQueue(type, apiServiceName) == null) {
            initWaitConfigurationQueue(type, apiServiceName);
        }
        return new Promise<C>(resolve => getWaitConfigurationQueue(type, apiServiceName).push(resolve));
    },

    registerFeignClientExecutorFactory(type: FeignClientType, factory: FeignClientExecutorFactory): void {
        FEIGN_CLIENT_EXECUTOR_FACTORIES[type] = factory;
    },

    getFeignClientExecutorFactory(type: FeignClientType): FeignClientExecutorFactory {
        const factory = FEIGN_CLIENT_EXECUTOR_FACTORIES[type];
        if (factory == null) {
            throw new Error(`not found type = ${type} client executor factory`);
        }
        return factory;
    }
};
/**
 * feign configuration registry
 */
export default registry
