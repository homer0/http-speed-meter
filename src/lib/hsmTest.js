/* eslint-disable no-console */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { loadESMLibs } from './esm.js';

// eslint-disable-next-line n/no-process-env
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
/**
 * This is the class all the tests extend. It takes care of receiving the URL from the CLI
 * arguments, messuring the time of the tests, encoding the results and even handling any
 * error the test may throw.
 *
 * @class
 * @author Homer0.
 */
export class HsmTest {
  /**
   * Class constructor.
   *
   * @returns {HsmTest}
   * @throws {Error} If no URL was sent on the CLI arguments.
   */
  constructor() {
    const { argv } = yargs(hideBin(process.argv));

    /**
     * The target URL the test should make the requests to.
     *
     * @type {string}
     */
    this.url = argv.url;

    if (!this.url) {
      throw new Error('No URL was specified');
    }
    /**
     * @ignore
     */
    this.test = this.test.bind(this);
    /**
     * @ignore
     */
    this.testJSON = this.testJSON.bind(this);
  }
  /**
   * Run all the test request methods.
   *
   * @returns {Promise} If all the request methods successfully finish, this method will
   *                    encode the results on JSON and log them so the _"tester_" can read
   *                    them. If anything goes wrong, it will use `console.error`
   *                    to log the error message.
   */
  async run() {
    try {
      await loadESMLibs();
      const raw = await this._runTest(this.test);
      const json = await this._runTest(this.testJSON);
      console.log(
        JSON.stringify({
          test: this.name,
          raw,
          json,
        }),
      );
    } catch (error) {
      console.error(`ERROR: ${error.message}`);
    }
  }
  /**
   * This is the method that should be extended for the raw/text request test.
   *
   * @param {Function} start   The callback that indicates the request has started.
   * @param {Function} finish  The callback to inform that the request has finished.
   * @param {Function} reject  The callback you should use if there's an error on the
   *                           request.
   * @returns {Promise}
   */
  test(start, finish, reject) {
    return reject('test method not extended');
  }
  /**
   * This is the method that should be extended for the JSON request test.
   *
   * @param {Function} start   The callback that indicates the request has started.
   * @param {Function} finish  The callback to inform that the request has finished.
   * @param {Function} reject  The callback you should use if there's an error on the
   *                           request.
   * @returns {Promise}
   */
  testJSON(start, finish, reject) {
    return reject('testJSON method not extended');
  }
  /**
   * This getter must be extended with the name of the package that it's being tested.
   *
   * @returns {string} The name of the package being tested.
   */
  get name() {
    return 'unknown test';
  }
  /**
   * A custom User Agent for the requests to use. It's the name of the class and the name
   * of the package being tested.
   * The reason I added this it's because the Github API doesn't allow requests without
   * User Agent, and that's the API I used to test this while I was building it.
   *
   * @returns {string} A custom User Agent for the requests.
   */
  get userAgent() {
    return `HsmTest: ${this.name}`;
  }
  /**
   * A utility method that creates an Error object from another Error or a String. The
   * main point is that it prefixes the message with the name of test :).
   *
   * @param {string | Error} error  The original error.
   * @returns {Error}
   * @ignore
   */
  _error(error) {
    const text = typeof error === 'object' ? error.message : error;
    return new Error(`[HsmTest] ${this.name}: ${text}`);
  }
  /**
   * A wrapper in top of a test method that will create Promise around it, set callbacks
   * to start and stop the timer and invoke the method with them as a reference.
   *
   * @param {Function} method  The test method to run.
   * @returns {Promise<number, Error>} If the test is sucessfull, the Promise will be
   *                                   resolved with the time (in ms) that took the
   *                                   request to be finished.
   * @ignore
   */
  _runTest(method) {
    return new Promise((resolve, reject) => {
      let startCalled = false;
      let startTime = 0;
      // eslint-disable-next-line jsdoc/require-jsdoc
      const start = () => {
        startCalled = true;
        startTime = Date.now();
      };
      // eslint-disable-next-line jsdoc/require-jsdoc
      const finish = () => {
        if (!startCalled) {
          reject(this._error('The `start` callback was never called'));
        }

        resolve(Date.now() - startTime);
      };

      method(start, finish, (error) => reject(this._error(error)));
    });
  }
}
