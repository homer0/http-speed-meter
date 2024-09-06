const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { loadESMLibs } = require('./lib/esm');
const { HsmTester } = require('.');

const cleanArgv = process.argv.filter((arg) => arg !== '--');
const { argv } = yargs(hideBin(cleanArgv));
const defaultURL = 'https://pokeapi.co/api/v2/pokemon/lugia';
const targetURL = argv.url || defaultURL;

loadESMLibs()
  .then(() =>
    new HsmTester(targetURL, './src/tests', {
      iterations: argv.iterations ? Number(argv.iterations) : 1,
      mock: argv.mock,
    }).run(argv.test || ''),
  )
  .then((tester) => tester.showResults())
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
