const { HsmTest, getLib } = require('..');

class NodeFetchTest extends HsmTest {
  test(start, finish, reject) {
    start();
    const fetch = getLib('node-fetch').default;
    fetch(this.url, {
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
    const fetch = getLib('node-fetch').default;
    fetch(this.url, {
      headers: {
        'User-Agent': this.userAgent,
      },
    })
      .then((response) => response.json())
      .then(() => finish())
      .catch((error) => reject(error));
  }
  get name() {
    return 'node-fetch';
  }
}

new NodeFetchTest().run();
