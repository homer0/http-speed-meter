const request = require('request');
const { HsmTest } = require('../');

class RequestTest extends HsmTest {

    get name() {
        return 'request';
    }

    test(start, finish, reject) {
        start();
        request({
            url: this.url,
            headers: {
                'User-Agent': this.userAgent,
            },
        }, (error) => {
            if (error) {
                reject(error);
            } else {
                finish();
            }
        });
    }

    testJSON(start, finish, reject) {
        start();
        request({
            url: this.url,
            json: true,
            headers: {
                'User-Agent': this.userAgent,
            },
        }, (error) => {
            if (error) {
                reject(error);
            } else {
                finish();
            }
        });
    }

}

new RequestTest().run();
