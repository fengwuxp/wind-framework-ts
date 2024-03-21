import * as log4js from "log4js";
import {newProxyInstance, newProxyInstanceEnhance, ProxyScope} from "../src";

const logger = log4js.getLogger();
logger.level = 'debug';

describe("test proxy factory", () => {

    const target = {

        prop: 1,

        a1(name) {
            logger.debug("--al-->", name, this && this.prop);
            return 'a1'
        },
        a2(...args) {
            logger.debug("--a2-->", ...args, this);
            return 'a2'
        }

    };


    test("test proxy all", () => {
        const proxy = newProxyInstance(target,
            (object: any, propertyKey: PropertyKey, receiver: any) => {
                logger.debug("proxy key", propertyKey,);
                return object[propertyKey];

            }, null, ProxyScope.ALL);
        expect(proxy.prop).toEqual(1);
        expect(proxy.a1("李四")).toEqual('a1');
    });

    test("test proxy only method", () => {

        const proxy = newProxyInstance(target,
            (object: any, propertyKey: PropertyKey, receiver: any) => {
                logger.debug("proxy", propertyKey,);
                return (...args) => {
                    return object[propertyKey](...args);
                }
            }, null,
            ProxyScope.METHOD,
            (object, propertyKey: string) => {

                return propertyKey === "a2";
            });
        expect(proxy.a2("李四")).toEqual('a2');

    });

    test("test proxy enhance", () => {
        const proxy: any = newProxyInstanceEnhance(target,
            (object: any, propertyKey: PropertyKey, receiver: any) => {
                logger.debug("proxy", propertyKey,);
                return (...args) => {
                    return object[propertyKey];
                }
            }, (object: any, propertyKey: PropertyKey, receiver: any) => {

                return (...args) => {
                    logger.debug("enhance", ...args);
                    return args[0]
                }
            });
        expect(proxy.a3("李四")).toEqual('李四');
    });

    test("test proxy only property", () => {
        const proxy = newProxyInstance(target,
            (object: any, propertyKey: PropertyKey, receiver: any) => {
                logger.debug("proxy", propertyKey,);
                return object[propertyKey]
            }, null, ProxyScope.PROPERTY);
        expect(proxy.prop).toEqual(1);
    });

    test("test proxy only set method", () => {
        const proxy = newProxyInstance(target,
            (object: any, propertyKey: PropertyKey, receiver: any) => {
                logger.debug("proxy", propertyKey,);
                return object[propertyKey]
            }, (object: any, propertyKey: PropertyKey, value, receiver: any) => {
                logger.debug("设置属性->", propertyKey, value);
                object[propertyKey] = value;
                return true;

            }, ProxyScope.ONLY_SET);
        proxy.prop = 2;
        expect(proxy.prop).toEqual(2);
    });
});
