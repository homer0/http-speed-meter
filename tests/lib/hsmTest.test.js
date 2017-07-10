/* eslint-disable no-console */
require('jasmine-expect');
const args = require('/tests/mocks/yargs.mock');
jest.setMock('yargs', args);

const HsmTest = require('/src/lib/hsmTest');

const originalErrorLog = console.error;
const originalLog = console.log;

describe('HsmTest', () => {
    beforeEach(() => {
        args.reset();
        console.error = originalErrorLog;
        console.log = originalLog;
    });

    it('should thrown an error if no URL was send as an argument', () => {
        expect(() => {
            new HsmTest();
        }).toThrow('No URL was specified');
    });

    it('should thrown an error if the \'test\' method is not overwritten', () => {
        args.setValues({
            url: 'http://homer0.com',
        });

        const errorLogMock = jest.fn();
        spyOn(console, 'error').and.callFake(errorLogMock);

        return new HsmTest().run()
        .then(() => {
            expect(errorLogMock.mock.calls.length).toBe(1);
            expect(errorLogMock.mock.calls[0][0]).toMatch(/test method not extended/i);
        });
    });

    it('should thrown an error if the \'testJSON\' method is not overwritten', () => {
        args.setValues({
            url: 'http://homer0.com',
        });

        const errorLogMock = jest.fn();
        spyOn(console, 'error').and.callFake(errorLogMock);

        class SubHsmTest extends HsmTest {

            test(start, finish) {
                start();
                finish();
            }

        }

        return new SubHsmTest().run()
        .then(() => {
            expect(errorLogMock.mock.calls.length).toBe(1);
            expect(errorLogMock.mock.calls[0][0]).toMatch(/testJSON method not extended/i);
        });
    });

    it('should be able to run both test methods', () => {
        args.setValues({
            url: 'http://homer0.com',
        });
        const logMock = jest.fn();
        spyOn(console, 'log').and.callFake(logMock);

        class SubHsmTest extends HsmTest {

            test(start, finish) {
                start();
                finish();
            }

            testJSON(start, finish) {
                start();
                finish();
            }

        }

        return new SubHsmTest().run()
        .then(() => {
            expect(logMock.mock.calls.length).toBe(1);
            expect(JSON.parse(logMock.mock.calls[0][0])).toEqual({
                test: 'unknown test',
                raw: 0,
                json: 0,
            });
        });
    });

    it('should return a custom user agent with the test name', () => {
        args.setValues({
            url: 'http://homer0.com',
        });

        const testName = 'Charito Test';

        class SubHsmTest extends HsmTest {

            get name() {
                return testName;
            }

        }

        expect(new HsmTest().userAgent).toBe('HsmTest: unknown test');
        expect(new SubHsmTest().userAgent).toBe(`HsmTest: ${testName}`);
    });

    it('should calculate the timing for each test', () => {
        args.setValues({
            url: 'http://homer0.com',
        });
        const logMock = jest.fn();
        spyOn(console, 'log').and.callFake(logMock);

        let initialTestTime = 0;
        let finalTestTime = 0;
        let initialJSONTestTime = 0;
        let finalJSONTestTime = 0;

        class SubHsmTest extends HsmTest {

            test(start, finish) {
                initialTestTime = Date.now();
                start();
                setTimeout(() => {
                    finalTestTime = Date.now();
                    finish();
                }, 100);
            }

            testJSON(start, finish) {
                initialJSONTestTime = Date.now();
                start();
                setTimeout(() => {
                    finalJSONTestTime = Date.now();
                    finish();
                }, 100);
            }

        }

        return new SubHsmTest().run()
        .then(() => {
            expect(logMock.mock.calls.length).toBe(1);
            expect(JSON.parse(logMock.mock.calls[0][0])).toEqual({
                test: 'unknown test',
                raw: (finalTestTime - initialTestTime),
                json: (finalJSONTestTime - initialJSONTestTime),
            });
        });
    });

    it(
        'should thrown an error if a test finish callback is called before the start callback',
        () => {
            args.setValues({
                url: 'http://homer0.com',
            });
            const errorLogMock = jest.fn();
            spyOn(console, 'error').and.callFake(errorLogMock);

            class SubHsmTest extends HsmTest {

                test(start, finish) {
                    finish();
                }

                testJSON(start, finish) {
                    start();
                    finish();
                }

            }

            return new SubHsmTest().run()
            .then(() => {
                expect(errorLogMock.mock.calls.length).toBe(1);
                expect(errorLogMock.mock.calls[0][0])
                .toMatch(/The `start` callback was never called/i);
            });
        }
    );

    it('should allow the test methods to reject the test if something goes wrong', () => {
        args.setValues({
            url: 'http://homer0.com',
        });
        const errorMessage = 'Something went wrong';
        const errorLogMock = jest.fn();
        spyOn(console, 'error').and.callFake(errorLogMock);

        class SubHsmTest extends HsmTest {

            test(start, finish, reject) {
                start();
                reject(new Error(errorMessage));
            }

            testJSON(start, finish) {
                start();
                finish();
            }

        }

        return new SubHsmTest().run()
        .then(() => {
            expect(errorLogMock.mock.calls.length).toBe(1);
            expect(errorLogMock.mock.calls[0][0])
            .toMatch(RegExp(errorMessage, 'i'));
        });
    });
});
