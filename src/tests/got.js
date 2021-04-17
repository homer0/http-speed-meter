const got = require('got');
const { HsmTest } = require('..');

class GotTest extends HsmTest {
  test(start, finish, reject) {
    start();
    got(this.url, {
      headers: {
        'User-Agent': this.userAgent,
      },
    })
      .then(() => finish())
      .catch((error) => reject(error));
  }

  testJSON(start, finish, reject) {
    start();
    got(this.url, {
      json: true,
      headers: {
        'User-Agent': this.userAgent,
      },
    })
      .then(() => finish())
      .catch((error) => reject(error));
  }
  get name() {
    return 'got';
  }
}

new GotTest().run();
