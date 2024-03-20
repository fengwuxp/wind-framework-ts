import * as log4js from "log4js";
import TestFeignClient from "./TestFeignClient";
import FeignConfigurationRegistry from "../src/configuration/FeignConfigurationRegistry";
import ExampleFeignClient from "./ExampleFeignClient";
import MockFeignConfiguration from "./MockFeignConfiguration";
import {ClientRequestDataValidatorHolder, defaultApiModuleName} from "../src";
import {FEIGN_HTTP} from "../src/annotations/Feign";

const logger = log4js.getLogger();
logger.level = 'debug';


describe("test feign client", () => {

    const mockFeignConfiguration = new MockFeignConfiguration();

    const testFeignClient = new TestFeignClient();
    const exampleFeignClient = new ExampleFeignClient();

    const sleep = (times) => {
        return new Promise((resolve) => {
            setTimeout(resolve, times)
        })
    };

    const NOT_FOUND_ERROR = {
        "data": undefined,
        "headers": null,
        "ok": false,
        "statusCode": 404,
        "statusText": "Not Found"
    }


    test("test feign client", async () => {
        sleep(200).then(() => {
            logger.info("异步设置设置配置")
            FeignConfigurationRegistry.setFeignConfiguration(FEIGN_HTTP, defaultApiModuleName, mockFeignConfiguration);
        })
        const result = await exampleFeignClient.findMember({
            name: "张三",
            userName: "1",
            memberId: 12,
            time: new Date()
        }).catch(error => error);

        expect(result).toEqual(NOT_FOUND_ERROR);
        const validateResult = await ClientRequestDataValidatorHolder.validate({
            name: "张三",
            userName: "1",
            memberId: 1
        }, {
            name: {
                required: true
            },
            memberId: {
                message: "用户不能为空",
                min: 1,
                required: true
            }
        }, false);
        expect(validateResult).toEqual({
            "memberId": 1,
            "name": "张三",
            "userName": "1",
        })
    }, 30 * 1000);


    test("test retry", async () => {

        try {
            sleep(200).then(() => {
                logger.info("异步设置设置配置")
                FeignConfigurationRegistry.setFeignConfiguration(FEIGN_HTTP, defaultApiModuleName, mockFeignConfiguration);
            })
            const result = await testFeignClient.testQuery({
                id: 1,
                date: new Date(),
                queryPage: "1",
                a: "hhh"
            });
            expect(result).toEqual({})
        } catch (error) {
            expect(error).toEqual(new Error("retry timeout, maxTimeout=9000, retry count = 4"))
        }
    }, 25 * 1000);


    const sendRequestEvent = async (num) => {
        const queue = [];
        for (let i = 0; i <= num; i++) {
            const times = Math.random() * 1000;
            await sleep(times);
            (function (index) {
                logger.debug(`开始发出第${index}个请求`);
                testFeignClient.deleteMember({
                    memberId: 1
                }, {
                    // useProgressBar: times % 2 == 0
                }).then((data) => {
                    logger.debug("----s---->", data)
                }).catch((e) => {
                    logger.debug("----e---->", e)
                }).finally(() => {
                    logger.debug(`收到了第${index}个请求的响应`);
                    queue.push(index);
                })
            })(i);
        }
        return queue;
    };

    test("test network status change", async () => {
        sleep(200).then(() => {
            logger.info("异步设置设置配置")
            FeignConfigurationRegistry.setFeignConfiguration(FEIGN_HTTP, defaultApiModuleName, mockFeignConfiguration);
        })
        const total = 10;
        const elements = [];
        for (let i = 0; i < total; i++) {
            elements.push(i)
        }
        try {
            const queue = await sendRequestEvent(total);
            expect(queue).toEqual(elements)
        } catch (error) {
            expect(error).toEqual(elements)
        }

    }, 160 * 1000);

    test("test auto upload file ", async () => {
        sleep(200).then(() => {
            logger.info("异步设置设置配置")
            FeignConfigurationRegistry.setFeignConfiguration(FEIGN_HTTP, defaultApiModuleName, mockFeignConfiguration);
        })
        try {
            const result = await testFeignClient.evaluateOrder({
                goods: [
                    "A",
                    "B",
                    "C",
                    "D"
                ]
            });
            expect(result).toBeNull();
        } catch (error) {
            expect(error).toEqual(NOT_FOUND_ERROR);
        }

    }, 20 * 1000);


    test("test deleted", async () => {
        sleep(200).then(() => {
            logger.info("异步设置设置配置")
            FeignConfigurationRegistry.setFeignConfiguration(FEIGN_HTTP, defaultApiModuleName, mockFeignConfiguration);
        })
        try {
            const result = await testFeignClient.deleteById({ids: [1, 2, 3, 4], a: "22", c: "33"});
            expect(result).toBeNull();
        } catch (error) {
            expect(error).toEqual(NOT_FOUND_ERROR);
        }
    });

});

