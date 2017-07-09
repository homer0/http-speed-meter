/* eslint-disable no-console */
const argv = require('yargs').argv;

class HsmTest {

    constructor() {
        this.url = argv.url;
        if (!this.url) {
            throw new Error('No URL was specified');
        }

        this.test = this.test.bind(this);
        this.testJSON = this.testJSON.bind(this);
    }

    run() {
        return Promise.all([
            this._runTest(),
            this._runTest('JSON'),
        ])
        .then(([raw, json]) => console.log(JSON.stringify({
            test: this.name,
            raw,
            json,
        })))
        .catch((error) => {
            console.error(`ERROR: ${error.message}`);
            process.exit(1);
        });
    }

    test() {
        throw new Error('test: Method not extended', this);
    }

    testJSON() {
        throw new Error('testJSON: Method not extended', this);
    }

    get userAgent() {
        return `HsmTest: ${this.name}`;
    }

    _runTest(method = '') {
        return new Promise((resolve, reject) => {
            let startCalled = false;
            let startTime = 0;
            const start = () => {
                startCalled = true;
                startTime = Date.now();
            };

            const finish = () => {
                if (!startCalled) {
                    reject(this._error('The `start` callback was never called'));
                }

                resolve(Date.now() - startTime);
            };

            this[`test${method}`](start, finish, error => reject(this._error(error)));
        });
    }

    _error(error) {
        const text = typeof error === 'object' ? (error.message || 'Unknown error') : error;
        return new Error(`[HsmTest] ${this.name}: ${text}`);
    }

}

module.exports = HsmTest;
