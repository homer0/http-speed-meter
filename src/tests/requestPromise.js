const request = require('request-promise');
const { HsmTest } = require('../');

class RequestPromiseTest extends HsmTest {

    get name() {
        return 'request-promise';
    }

    test(start, finish, reject) {
        start();
        request({
            url: this.url,
            headers: {
                'User-Agent': this.userAgent,
            },
        })
        .then(() => finish())
        .catch(error => reject(error));
    }

    testJSON(start, finish, reject) {
        start();
        request({
            url: this.url,
            json: true,
            headers: {
                'User-Agent': this.userAgent,
            },
        })
        .then(() => finish())
        .catch(error => reject(error));
    }

}

new RequestPromiseTest().run();
