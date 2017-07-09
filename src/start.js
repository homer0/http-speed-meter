const argv = require('yargs').argv;
const { HsmTester } = require('./');

const defaultURL = 'https://api.github.com/users/homer0/repos';

new HsmTester({
    path: './src/tests',
    url: argv.url || defaultURL,
    iterations: argv.iterations ? Number(argv.iterations) : 1,
    silent: false,
    mock: argv.mock,
})
.run(argv.test || '')
.then(tester => tester.showResults())
.catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
});
