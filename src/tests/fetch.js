import { HsmTest } from '../index.js';

class FetchTest extends HsmTest {
  test(start, finish, reject) {
    start();
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
    return 'fetch';
  }
}

new FetchTest().run();
