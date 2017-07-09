const fetch = require('node-fetch');
const { HsmTest } = require('../');

class NodeFetchTest extends HsmTest {

    get name() {
        return 'node-fetch';
    }

    test(start, finish, reject) {
        start();
        fetch(this.url, {
            headers: {
                'User-Agent': this.userAgent,
            },
        })
        .then(response => response.text())
        .then(() => finish())
        .catch(error => reject(error));
    }

    testJSON(start, finish, reject) {
        start();
        fetch(this.url, {
            headers: {
                'User-Agent': this.userAgent,
            },
        })
        .then(response => response.json())
        .then(() => finish())
        .catch(error => reject(error));
    }

}

new NodeFetchTest().run();
