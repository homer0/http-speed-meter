import superagent from 'superagent';
import { HsmTest } from '../index.js';

class SuperAgentTest extends HsmTest {
  test(start, finish, reject) {
    start();
    superagent
      .get(this.url)
      .set('User-Agent', this.userAgent)
      .parse((res, fn) => {
        res.text = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          res.text += chunk;
        });
        res.on('end', () => fn());
      })
      .end((error) => {
        if (error) {
          reject(error);
        } else {
          finish();
        }
      });
  }

  testJSON(start, finish, reject) {
    start();
    superagent
      .get(this.url)
      .set('User-Agent', this.userAgent)
      .end((error) => {
        if (error) {
          reject(error);
        } else {
          finish();
        }
      });
  }
  get name() {
    return 'superagent';
  }
}

new SuperAgentTest().run();
