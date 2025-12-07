import axios from 'axios';
import { HsmTest } from '../index.js';

class AxiosTest extends HsmTest {
  test(start, finish, reject) {
    start();
    axios({
      url: this.url,
      transformResponse: [(data) => data],
      headers: {
        'User-Agent': this.userAgent,
      },
    })
      .then(() => finish())
      .catch((error) => reject(error));
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
      .catch((error) => reject(error));
  }
  get name() {
    return 'axios';
  }
}

new AxiosTest().run();
