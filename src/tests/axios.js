const axios = require('axios');
const { HsmTest } = require('../');

class AxiosTest extends HsmTest {

    get name() {
        return 'axios';
    }

    test(start, finish, reject) {
        start();
        axios({
            url: this.url,
            transformResponse: [data => data],
            headers: {
                'User-Agent': this.userAgent,
            },
        })
        .then(() => finish())
        .catch(error => reject(error));
    }

    testJSON(start, finish, reject) {
        start();
        axios({
            url: this.url,
            headers: {
                'User-Agent': this.userAgent,
            },
        })
        .then(() => finish())
        .catch(error => reject(error));
    }

}

new AxiosTest().run();
