import reqwest from 'reqwest';
import { HsmTest } from '../index.js';

class ReqwestTest extends HsmTest {
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
      .fail((error) => reject(error));
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
      .fail((error) => reject(error));
  }
  get name() {
    return 'reqwest';
  }
}

new ReqwestTest().run();
