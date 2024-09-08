const { request } = require('undici');
const { HsmTest } = require('..');

class UndiciTest extends HsmTest {
  test(start, finish, reject) {
    start();
    request(this.url, {
      headers: {
        'User-Agent': this.userAgent,
      },
    })
      .then(({ body }) => body.text())
      .then(() => finish())
      .catch((error) => reject(error));
  }

  testJSON(start, finish, reject) {
    start();
    request(this.url, {
      headers: {
        'User-Agent': this.userAgent,
      },
    })
      .then(({ body }) => body.json())
      .then(() => finish())
      .catch((error) => reject(error));
  }
  get name() {
    return 'undici';
  }
}

new UndiciTest().run();
