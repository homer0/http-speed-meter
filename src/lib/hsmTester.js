const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const prettyMs = require('pretty-ms');
const chalk = require('chalk');
const dependencies = require('../../package.json').dependencies;

class HsmTester {

    constructor(testsURL, testsPath, options = {}) {
        this.url = testsURL;
        this.path = path.join(process.cwd(), testsPath);
        this.tests = this._findAllTheTests();

        this.iterations = options.iterations || 1;
        this.results = {};
        this.mock = options.mock ? this._setupMocks(options.mock) : null;
        this.maxColumns = options.maxColumns || 100;
        this.normalizedNames = options.normalizedNames || {
            json: 'JSON',
            raw: 'Text',
        };

        this.colors = options.colors || [
            'red',
            'green',
            'yellow',
            'blue',
            'magenta',
            'cyan',
            'white',
        ];

        this._currentColorsIndex = -1;
    }

    run(name = '') {
        return this.mock ? Promise.resolve(this) : this._run(name);
    }

    _run(name) {
        let list;
        if (!name) {
            list = Object.keys(this.tests);
        } else {
            const isRegex = typeof name === 'object';
            list = Object.keys(this.tests).filter(
                test => ((isRegex && name.test(test)) || (!isRegex && name === test))
            );
        }

        return Promise.all(list.map((test) => {
            const iterationsPromises = [];
            for (let i = 0; i < this.iterations; i++) {
                iterationsPromises.push(this._runTest(test));
            }

            return Promise.all(iterationsPromises);
        }))
        .then(() => this);
    }

    _runTest(name) {
        return new Promise((resolve, reject) => {
            shell.exec(
                `node ${this.tests[name]} --url=${this.url}`,
                {
                    silent: true,
                    async: true,
                },
                (code, stdout, stderr) => {
                    if (code === 0) {
                        this._addResultOutput(name, stdout);
                        resolve();
                    } else {
                        reject(stderr.trim());
                    }
                }
            );
        });
    }

    showResults() {
        let higher = 0;
        const testPackageByName = {};
        const testNames = Object.keys(this.results);
        testNames.forEach((name) => {
            this.results[name].forEach((iteration, index) => {
                if (index === 0) {
                    testPackageByName[name] = iteration.test;
                }

                Object.keys(iteration).forEach((propName) => {
                    const prop = iteration[propName];
                    if (typeof prop === 'number' && prop > higher) {
                        higher = prop;
                    } else if (typeof prop !== 'number') {
                        delete iteration[propName];
                    }
                });
            });
        });

        const results = {};
        testNames.forEach((name) => {
            const totalsByIteration = {};
            this.results[name].forEach((iteration) => {
                Object.keys(iteration).forEach((propName) => {
                    if (typeof totalsByIteration[propName] === 'undefined') {
                        totalsByIteration[propName] = 0;
                    }

                    totalsByIteration[propName] += iteration[propName];
                });
            });

            const averages = {};
            Object.keys(totalsByIteration).forEach((iterationName) => {
                averages[iterationName] = Math.floor(
                    (totalsByIteration[iterationName] / this.results[name].length)
                );
            });

            const times = {};

            Object.keys(averages).forEach((iterationName) => {
                times[iterationName] = this._formatRequest(
                    iterationName,
                    averages[iterationName],
                    higher
                );
            });

            results[name] = {
                info: this._getInfo(testPackageByName[name]),
                times,
            };
        });

        const tab = '    ';
        const lines = [''];
        lines.push(chalk.underline.bold('HTTP Speed Meter - Average Results\n'));
        lines.push(chalk.dim(`${tab}Target URL: ${this.url}`));
        lines.push(chalk.dim(`${tab}Iterations: ${this.iterations}\n`));

        Object.keys(this.normalizedNames).forEach((formatName) => {
            const title = this.normalizedNames[formatName];
            const titleLine = chalk.underline.bold(`Test: ${title}\n`);
            lines.push(`${tab}${titleLine}`);
            const bars = [];
            const labels = {};
            let startBarsAt = 0;

            testNames.forEach((testName) => {
                const color = this._getColor();
                const { info, times } = results[testName];
                const label = `${tab}${info.name}@${info.version}  `;
                if (label.length > startBarsAt) {
                    startBarsAt = label.length;
                }

                labels[testName] = {
                    label,
                    time: times[formatName],
                    color,
                };
            });

            testNames.forEach((testName) => {
                const info = labels[testName];
                let newLabel = info.label;
                for (let i = newLabel.length; i < info.time.width; i++) {
                    newLabel += i < startBarsAt ? ' ' : '█';
                }

                newLabel += ` ${info.time.time}`;

                bars.push(chalk[info.color](newLabel));
            });

            lines.push(...bars);

            lines.push('\n');
        });

        // eslint-disable-next-line no-console
        lines.forEach(line => console.log(line));
    }

    _getColor() {
        this._currentColorsIndex++;
        if (!this.colors[this._currentColorsIndex]) {
            this._currentColorsIndex = 0;
        }

        return this.colors[this._currentColorsIndex];
    }

    _formatRequest(name, value, higher) {
        const percentage = Math.floor((value * 100) / higher);
        const width = Math.floor((this.maxColumns / 100) * percentage);
        return {
            width,
            title: this.normalizedNames[name],
            raw: value,
            time: prettyMs(value),
        };
    }

    _getInfo(depName) {
        if (!dependencies[depName]) {
            throw new Error(`There's no info about '${depName}' on the package.json`);
        }

        const { name, version, repository } = JSON.parse(fs.readFileSync(path.join(
            process.cwd(),
            `node_modules/${depName}/package.json`
        )));

        let repositoryURL = typeof repository === 'string' ? repository : repository.url;
        if (!repositoryURL.includes('://')) {
            repositoryURL = `https://github.com/${repositoryURL}`;
        }

        repositoryURL = repositoryURL.replace(/\.git$/i, '');
        repositoryURL = repositoryURL.replace(/git\+https/i, 'https');

        return {
            name,
            version,
            repository: repositoryURL,
        };
    }

    _addResultOutput(test, rawOutput) {
        if (!this.results[test]) {
            this.results[test] = [];
        }

        this.results[test].push(JSON.parse(rawOutput.trim()));
    }

    _findAllTheTests() {
        const tests = {};
        fs.readdirSync(this.path).forEach((filename) => {
            const file = filename.toLowerCase();
            if (file.endsWith('.js')) {
                tests[file.replace(/.js$/, '')] = path.join(this.path, file);
            }
        });

        return tests;
    }

    _setupMocks(filepath) {
        const mockpath = path.join(process.cwd(), filepath);
        let result = false;
        try {
            this.results = JSON.parse(fs.readFileSync(mockpath, 'utf-8'));
            result = true;
        } catch (error) {
            throw error;
        }

        return result;
    }

}

module.exports = HsmTester;
