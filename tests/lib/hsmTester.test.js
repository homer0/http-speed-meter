/* eslint-disable no-console */
jest.mock('fs');
jest.unmock('../../src/lib/hsmTester');

const fs = require('fs');
const shell = require('../mocks/shell.mock');
const spinner = require('../mocks/spinner.mock');

jest.setMock('shelljs', shell);
jest.setMock('cli-spinner', spinner);

const HsmTester = require('../../src/lib/hsmTester');

const originalLog = console.log;

describe('HsmTester', () => {
  beforeEach(() => {
    fs.readdirSync.mockReset();
    fs.readFileSync.mockReset();
    shell.reset();
    spinner.reset();
    console.log = originalLog;
  });

  it('should be instantiated with all the default options', () => {
    fs.readdirSync = jest.fn(() => []);
    const sub = new HsmTester('http://homer0.com', './');
    expect(sub.iterations).toBe(1);
    expect(sub.mock).toBeNull();
    expect(sub.maxColumns).toBe(80);
    expect(sub.normalizedNames).toEqual({
      json: 'JSON',
      raw: 'Text',
    });
    expect(sub.colors).toEqual([
      'red',
      'green',
      'yellow',
      'blue',
      'magenta',
      'cyan',
      'white',
    ]);
  });

  it('should be able to overwrite all the options (except mocks)', () => {
    fs.readdirSync = jest.fn(() => []);
    const customOptions = {
      iterations: 25092015,
      maxColumns: 12,
      normalizedNames: {
        json: 'Cosmic',
        raw: 'Magic',
      },
      colors: ['black'],
    };

    const sub = new HsmTester('http://homer0.com', './', customOptions);
    expect(sub.iterations).toBe(customOptions.iterations);
    expect(sub.maxColumns).toBe(customOptions.maxColumns);
    expect(sub.normalizedNames).toEqual(customOptions.normalizedNames);
    expect(sub.colors).toEqual(customOptions.colors);
  });

  it('should be able to read and setup mocked results', () => {
    const customMock = {
      charito: [
        {
          json: 25092015,
          raw: 1.9,
          test: 'charito',
        },
      ],
    };

    fs.readdirSync = jest.fn(() => []);
    fs.readdirSync = jest.fn(() => ['mockFile.json']);
    fs.readFileSync = jest.fn(() => JSON.stringify(customMock));
    const sub = new HsmTester('http://homer0.com', './', {
      mock: 'yes-please',
    });

    expect(sub.mock).toBe(true);
    expect(sub.results).toEqual(customMock);
  });

  it('should fail while reading a mock and throw an exception', () => {
    fs.readdirSync = jest.fn(() => []);
    fs.readdirSync = jest.fn(() => ['mockFile.json']);
    fs.readFileSync = jest.fn(() => 'invalid-json');
    expect(
      () =>
        new HsmTester('http://homer0.com', './', {
          mock: 'yes-please',
        }),
    ).toThrowError();
  });

  it('should be able to find all the tests on a directory', () => {
    fs.readdirSync = jest.fn(() => ['myTest.js', '.DS_Store']);
    const sub = new HsmTester('http://homer0.com', './tests-folder');
    expect(typeof sub.tests.mytest).toBe('string');
    expect(sub.tests.mytest).toMatch(/tests\-folder\/myTest\.js$/i);
  });

  it('should be able to run one specific test by the test name', () => {
    const targetURL = 'http://homer0.com';
    const testsPath = 'test-folder/more-tests';
    const testFile = 'charito.js';
    const testName = 'charito';
    const testResponse = {
      message: 'success!',
    };

    const spinnerContext = {
      clearLine: jest.fn(),
      stream: {
        write: jest.fn(),
      },
    };

    const spinnerText = 'loading!';

    fs.readdirSync = jest.fn(() => [testFile]);
    shell.addExecCallback(0, JSON.stringify(testResponse));

    const sub = new HsmTester(targetURL, testsPath);
    return sub.run('charito').then((ref) => {
      expect(ref).toEqual(sub);

      const commandRegex = RegExp(`${testsPath}/${testFile} --url=${targetURL}$`);
      expect(shell.commands[0]).toMatch(commandRegex);
      expect(sub.results[testName]).toEqual([testResponse]);
      expect(spinner.new.mock.calls.length).toBe(1);
      expect(typeof spinner.new.mock.calls[0][0].onTick).toBe('function');
      spinner.new.mock.calls[0][0].onTick.apply(spinnerContext, [spinnerText]);
      expect(spinnerContext.clearLine.mock.calls.length).toBe(1);
      expect(spinnerContext.stream.write.mock.calls.length).toBe(1);
      expect(spinner.start.mock.calls.length).toBe(1);
      expect(spinner.stop.mock.calls.length).toBe(1);
    });
  });

  it('should be able to run one specifc test using a regex', () => {
    const targetURL = 'http://homer0.com';
    const testsPath = 'test-folder/more-tests';
    const testFile = 'charito.js';
    const testName = 'charito';
    const testResponse = {
      message: 'success!',
    };

    fs.readdirSync = jest.fn(() => [testFile]);
    shell.addExecCallback(0, JSON.stringify(testResponse));

    const sub = new HsmTester(targetURL, testsPath);
    return sub.run(/chari/).then((ref) => {
      expect(ref).toEqual(sub);

      const commandRegex = RegExp(`${testsPath}/${testFile} --url=${targetURL}$`);
      expect(shell.commands[0]).toMatch(commandRegex);
      expect(sub.results[testName]).toEqual([testResponse]);
    });
  });

  it('should be able to run all the tests it found', () => {
    const targetURL = 'http://homer0.com';
    const testsPath = 'test-folder/more-tests';
    const testFiles = ['charito.js', 'maru.js'];
    const testNames = ['charito', 'maru'];
    const testResponse = {
      message: 'success!',
    };

    const testJSONResponse = JSON.stringify(testResponse);

    fs.readdirSync = jest.fn(() => testFiles);
    shell.addExecCallback([
      {
        code: 0,
        stdout: testJSONResponse,
      },
      {
        code: 0,
        stdout: testJSONResponse,
      },
    ]);

    const sub = new HsmTester(targetURL, testsPath);
    return sub.run().then((ref) => {
      expect(ref).toEqual(sub);
      testFiles.forEach((testFile, index) => {
        const commandRegex = RegExp(`${testsPath}/${testFile} --url=${targetURL}$`);
        expect(shell.commands[index]).toMatch(commandRegex);
        expect(sub.results[testNames[index]]).toEqual([testResponse]);
      });
    });
  });

  it('should be able to run multiple iterations for a test', () => {
    const targetURL = 'http://homer0.com';
    const testsPath = 'test-folder/more-tests';
    const testFile = 'charito.js';
    const testName = 'charito';
    const testResponses = [
      {
        message: 'hello',
      },
      {
        message: 'goodbye',
      },
    ];

    fs.readdirSync = jest.fn(() => [testFile]);
    shell.addExecCallback([
      {
        code: 0,
        stdout: JSON.stringify(testResponses[0]),
      },
      {
        code: 0,
        stdout: JSON.stringify(testResponses[1]),
      },
    ]);

    const sub = new HsmTester(targetURL, testsPath, {
      iterations: 2,
    });

    return sub.run().then((ref) => {
      expect(ref).toEqual(sub);

      const commandRegex = RegExp(`${testsPath}/${testFile} --url=${targetURL}$`);
      expect(shell.commands.length).toBe(2);
      expect(shell.commands[0]).toMatch(commandRegex);
      expect(shell.commands[1]).toMatch(commandRegex);
      expect(sub.results[testName]).toEqual(testResponses);
    });
  });

  it("should be reject the 'run' promise if a test fails", () => {
    const targetURL = 'http://homer0.com';
    const testsPath = 'test-folder/more-tests';
    const testFile = 'charito.js';
    const errorReponse = 'Something failed because of the magic of the universe';

    fs.readdirSync = jest.fn(() => [testFile]);
    shell.addExecCallback(10, '', errorReponse);

    const sub = new HsmTester(targetURL, testsPath);
    return sub
      .run('charito')
      .then(() => {
        expect(1).toBe(2);
      })
      .catch((error) => {
        expect(error).toEqual(errorReponse);
      });
  });

  it("should be reject the 'run' promise if a test doesn't return a JSON", () => {
    const targetURL = 'http://homer0.com';
    const testsPath = 'test-folder/more-tests';
    const testFile = 'charito.js';

    fs.readdirSync = jest.fn(() => [testFile]);
    shell.addExecCallback(0, 'charito :D!');

    const sub = new HsmTester(targetURL, testsPath);
    return sub
      .run('charito')
      .then(() => {
        expect(1).toBe(2);
      })
      .catch((error) => {
        expect(error.message).toMatch(/Unexpected token/i);
      });
  });

  it('should be able to print out the resoluts on the console', () => {
    const targetURL = 'http://homer0.com';
    const customMock = {
      axios: [
        {
          json: 2460,
          raw: 2356,
          test: 'axios',
        },
        {
          json: 2385,
          raw: 2386,
          test: 'axios',
        },
      ],
      got: [
        {
          json: 1305,
          raw: 1400,
          test: 'got',
        },
        {
          json: 1390,
          raw: 1372,
          test: 'got',
        },
      ],
    };

    const axiosPackage = {
      name: 'axios',
      version: '25.09.2015',
      repository: {
        type: 'git',
        url: 'https://github.com/mzabriskie/axios',
      },
    };

    const gotPackage = {
      name: 'got',
      version: '25.09.2015',
      repository: 'sindresorhus/got',
    };

    const readReponse = [customMock, axiosPackage, gotPackage];

    let currentReadIndex = -1;

    fs.readdirSync = jest.fn(() => []);
    fs.readdirSync = jest.fn(() => ['mockFile.json']);
    fs.readFileSync = jest.fn(() => {
      currentReadIndex++;
      return JSON.stringify(readReponse[currentReadIndex]);
    });

    const logMock = jest.fn();
    spyOn(console, 'log').and.callFake(logMock);

    return new HsmTester(targetURL, './', {
      mock: 'yes-please',
      colors: ['black'],
    })
      .run()
      .then((ref) => ref.showResults())
      .then(() => {
        const { mock } = logMock;
        expect(mock.calls.length).toBe(12);
        expect(mock.calls[0][0].trim()).toBe('');
        expect(mock.calls[1][0]).toMatch(/http speed meter/i);
        expect(mock.calls[2][0]).toMatch(RegExp(targetURL, 'i'));
        expect(mock.calls[3][0]).toMatch(/iterations: 1/i);
        expect(mock.calls[4][0]).toMatch(/test: json/i);
        expect(mock.calls[5][0]).toMatch(
          RegExp(`${axiosPackage.name}@${axiosPackage.version}\\W+█+ \\d(?:(\\.\\d)?)s`),
        );
        expect(mock.calls[6][0]).toMatch(
          RegExp(`${gotPackage.name}@${gotPackage.version}\\W+█+ \\d(?:(\\.\\d)?)s`),
        );
        expect(mock.calls[7][0].trim()).toBe('');
        expect(mock.calls[8][0]).toMatch(/test: text/i);
        expect(mock.calls[9][0]).toMatch(
          RegExp(`${axiosPackage.name}@${axiosPackage.version}\\W+█+ \\d(?:(\\.\\d)?)s`),
        );
        expect(mock.calls[10][0]).toMatch(
          RegExp(`${gotPackage.name}@${gotPackage.version}\\W+█+ \\d(?:(\\.\\d)?)s`),
        );
        expect(mock.calls[11][0].trim()).toBe('');
      });
  });

  it('should fail when trying to print the results for an unkwown dependency', () => {
    const unkwnownDependency = 'charito';
    const customMock = {
      [unkwnownDependency]: [
        {
          json: 2460,
          raw: 2356,
          test: unkwnownDependency,
        },
        {
          json: 2385,
          raw: 2386,
          test: unkwnownDependency,
        },
      ],
    };

    fs.readdirSync = jest.fn(() => []);
    fs.readdirSync = jest.fn(() => ['mockFile.json']);
    fs.readFileSync = jest.fn(() => JSON.stringify(customMock));

    return new HsmTester('batman.com', './', {
      mock: 'yes-please',
    })
      .run()
      .then((ref) => ref.showResults())
      .then(() => {
        expect(1).toBe(2);
      })
      .catch((error) => {
        expect(error.message).toMatch(
          RegExp(
            `there's no info about \'${unkwnownDependency}\' on the package.json`,
            'i',
          ),
        );
      });
  });
});
