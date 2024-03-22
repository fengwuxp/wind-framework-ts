import {Log4jLogger} from "./Log4jLogger";
import ConsoleLogger from "./ConsoleLogger";
import DelegateLog4jLogger from "./DelegateLog4jLogger";


export interface HttpLog4jFactory {

    getLogger: (category?: string) => Log4jLogger;

    getRootLogger: () => Log4jLogger;
}

const ROOT_LOGGER = new ConsoleLogger("root")

export let DefaultHttpLo4jFactory: HttpLog4jFactory = {
    getLogger: (category?: string) => new DelegateLog4jLogger(ROOT_LOGGER, category),
    getRootLogger: () => ROOT_LOGGER
};

export const setDefaultHttpLo4jFactory = (factory: HttpLog4jFactory) => {
    DefaultHttpLo4jFactory = factory;
}
