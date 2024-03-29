const { HsmTest, getLib } = require('..');

class GotTest extends HsmTest {
  test(start, finish, reject) {
    start();
    const got = getLib('got').default;
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
    const got = getLib('got').default;
    got(this.url, {
      responseType: 'json',
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
