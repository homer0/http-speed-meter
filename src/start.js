const { argv } = require('yargs');
const { HsmTester } = require('.');

const defaultURL = 'https://api.github.com/users/homer0/repos';
const targetURL = argv.url || defaultURL;

new HsmTester(targetURL, './src/tests', {
  iterations: argv.iterations ? Number(argv.iterations) : 1,
  mock: argv.mock,
})
  .run(argv.test || '')
  .then((tester) => tester.showResults())
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
