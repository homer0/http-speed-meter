const { HsmTest, getLib } = require('..');

class KyTest extends HsmTest {
  test(start, finish, reject) {
    start();
    const ky = getLib('ky').default;
    ky.get(this.url, {
      headers: {
        'User-Agent': this.userAgent,
      },
    })
      .then((response) => response.text())
      .then(() => finish())
      .catch((error) => reject(error));
  }

  testJSON(start, finish, reject) {
    start();
    const ky = getLib('ky').default;
    ky.get(this.url, {
      headers: {
        'User-Agent': this.userAgent,
      },
    })
      .then((response) => response.json())
      .then(() => finish())
      .catch((error) => reject(error));
  }
  get name() {
    return 'ky';
  }
}

new KyTest().run();
