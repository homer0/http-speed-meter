const reqwest = require('reqwest');
const { HsmTest } = require('../');

class ReqwestTest extends HsmTest {

    get name() {
        return 'reqwest';
    }

    test(start, finish, reject) {
        start();
        reqwest({
            url: this.url,
            type: 'text',
            headers: {
                Accept: 'application/json',
                'User-Agent': this.userAgent,
            },
        })
        .then(() => finish())
        .fail(error => reject(error));
    }

    testJSON(start, finish, reject) {
        start();
        reqwest({
            url: this.url,
            type: 'json',
            headers: {
                'User-Agent': this.userAgent,
            },
        })
        .then(() => finish())
        .fail(error => reject(error));
    }

}

new ReqwestTest().run();
