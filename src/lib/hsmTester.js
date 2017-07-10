const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const prettyMs = require('pretty-ms');
const chalk = require('chalk');
const Spinner = require('cli-spinner').Spinner;
const dependencies = require('../../package.json').dependencies;
/**
 * The main class of the project. This _"tester class"_ is in charge of finding all the test files,
 * running them and show the output on the console.
 * @class
 * @author homer0
 */
class HsmTester {
    /**
     * Class constructor.
     * @param {String} testsURL     The target URL for the tests to make the requests.
     * @param {String} testsPath    The path, relative to where you are running the script, in
     *                              which all the test files are stored.
     * @param {Object} [options={}] Optional. Custom options that overwrite the class defaults.
     * @property {Number} iterations      Optional. The number of iterations the tests must run.
     *                                    `1` by default.
     * @property {String} mock            Optional. The path, relative to where you are running the
     *                                    script, of a results mock file. This is usefull for
     *                                    coding the output.
     * @property {Number} maxColumns      Optional. The maxium number of columns a chart bar can
     *                                    take on the results output. `100` by default.
     * @property {Object} normalizedNames Optional. The titles you want to see for each test type;
     *                                    for example: `{ json: 'JSON', raw: 'Text'}`.
     * @property {Array}  colors          Optional. A list of the different colors the output can
     *                                    use. They need to be supported by `chalk@^2.0.0`.
     * @return {HsmTester}
     */
    constructor(testsURL, testsPath, options = {}) {
        /**
         * The URL all the tests are going to make the requests to.
         * @type {String}
         */
        this.url = testsURL;
        /**
         * The absolute path where all the tests are located.
         * @type {String}
         */
        this.path = path.join(process.cwd(), testsPath);
        /**
         * A dictionary where the keys are the test names and the values are the absolute path to
         * their files.
         * @type {Object}
         */
        this.tests = this._findAllTheTests();
        /**
         * The number of iterations the tests will make.
         * @type {Number}
         */
        this.iterations = options.iterations || 1;
        /**
         * Once the tests run, this dictionary will have all the information of the tests. The key
         * will be the test name.
         * @type {Object}
         */
        this.results = {};
        /**
         * Whether or not the _"tester"_ was initialized with mocked results.
         * @type {Boolean}
         */
        this.mock = options.mock ? this._setupMocks(options.mock) : null;
        /**
         * The maxium number of columns the chart bar can take on the console.
         * @type {Number}
         */
        this.maxColumns = options.maxColumns || 100;
        /**
         * The normalized name of the known tests types.
         * @type {Object}
         */
        this.normalizedNames = options.normalizedNames || {
            json: 'JSON',
            raw: 'Text',
        };
        /**
         * The list of colors the _"tester"_ can use on the output.
         * @type {Array}
         */
        this.colors = options.colors || [
            'red',
            'green',
            'yellow',
            'blue',
            'magenta',
            'cyan',
            'white',
        ];
        /**
         * When you call `getColor`, this counter will be incremented and the value of `this.colors`
         * at that index will be returned; if there's no color available at that index, the counter
         * will be reseted and the first color will be returned instead.
         * @type {Number}
         * @ignore
         */
        this._currentColorsIndex = -1;
    }
    /**
     * Run the tests.
     * @param {String|RegExp} [name=''] Optional. By default, it runs all the tests it found at the
     *                                  moment it was initialized, but if this parameter is a
     *                                  `string`, it will only run the test which name is equal to
     *                                  the string; but if the parameter is a regular expression,
     *                                  it will only run tests that match that expression.
     * @return {Promise<HsmTester, Error>} If all the tests successfully ran, then the promise will
     *                                     be resolved with a reference to this instance (for
     *                                     chaining purposes); but if something goes wrong with any
     *                                     of the tests, the Promise will be automatically rejected.
     */
    run(name = '') {
        return this.mock ? Promise.resolve(this) : this._run(name);
    }
    /**
     * Process all the tests information and show it on the screen.
     */
    showResults() {
        /**
         * This will be the highest time of all the tests, so the method can calculate the
         * percentage of the bars width.
         */
        let highest = 0;
        // A dictionary with the packages name by the name of the test that uses.
        const testPackageByName = {};
        // The list of test names. Just a reference to avoid calling `Object.keys` more than once.
        const testNames = Object.keys(this.results).sort();
        // First loop: Find the highest time, and create the relation test -> package.
        testNames.forEach((name) => {
            this.results[name].forEach((iteration, index) => {
                /**
                 * All the other iterations will have the same name, so let's take it from the
                 * first one.
                 */
                if (index === 0) {
                    testPackageByName[name] = iteration.test;
                }

                // Sub loop: Find the highest time in all the iterations.
                Object.keys(iteration).forEach((propName) => {
                    const prop = iteration[propName];
                    // If the property is the highest number, save it.
                    if (typeof prop === 'number' && prop > highest) {
                        highest = prop;
                    } else if (typeof prop !== 'number') {
                        // If the property is not a Number, it's probably the name, delete it.
                        delete iteration[propName];
                    }
                });
            });
        });

        /**
         * This dictionary will have the package information and the average times for all the
         * tests.
         */
        const results = {};
        // Second loop: Let's calculate the averages.
        testNames.forEach((name) => {
            /**
             * This dictionary will sum up all the times for all the same types of requests the
             * test has made.
             */
            const totalsByType = {};
            /**
             * Sub loop 1: Loop all the iterations and all their request types in order to add them
             * to `totalsByType`, before calculating the average.
             */
            this.results[name].forEach((iteration) => {
                // Sub loop 2: Find the time of each of the requests for the current iteration.
                Object.keys(iteration).forEach((propName) => {
                    // I couldn't use a _falsy_ check because I needed the initial value to be `0`.
                    if (typeof totalsByType[propName] === 'undefined') {
                        totalsByType[propName] = 0;
                    }
                    // Adding them up...
                    totalsByType[propName] += iteration[propName];
                });
            });

            /**
             * This dictionary will have all the necessary information (obtained from
             * `this._formatRequest`) for each request type average time.
             */
            const times = {};
            /**
             * Sub loop 3: For each total time of request types, calculate the average and format
             * the data so it can be used on the output.
             */
            Object.keys(totalsByType).forEach((type) => {
                times[type] = this._formatRequest(
                    type,
                    Math.floor((totalsByType[type] / this.results[name].length)),
                    highest
                );
            });
            // Finally, add the package info and the timing info to the `results` dictionary.
            results[name] = {
                info: this._getInfo(testPackageByName[name]),
                times,
            };
        });

        this._output(results);
    }
    /**
     * The _"real"_ `run` method. The previous one checks if there the results are mocked and if
     * they are, it resolves the Promise without doing anything, but if it needs to call the real
     * tests, it returns this method.
     * This method first filters the list of tests it will run, then turns the spinner on and
     * triggers all the iterations for each of the tests it needs to run. Once they are all
     * resolved (by the magic of `Promise.all` inside `Promise.all`) it, once again, resolves the
     * main promise with the instance reference (for chaining purposes).
     * @param {String|RegExp} name Optional. By default, it runs all the tests it found at the
     *                             moment it was initialized, but if this parameter is a
     *                             `string`, it will only run the test which name is equal to
     *                             the string; but if the parameter is a regular expression,
     *                             it will only run tests that match that expression.
     * @return {Promise<HsmTester, Error>} If all the tests successfully ran, then the promise will
     *                                     be resolved with a reference to this instance (for
     *                                     chaining purposes); but if something goes wrong with any
     *                                     of the tests, the Promise will be automatically rejected.
     * @ignore
     */
    _run(name) {
        // Filter the list.
        let list;
        if (!name) {
            list = Object.keys(this.tests);
        } else {
            const isRegex = typeof name === 'object';
            list = Object.keys(this.tests).filter(
                test => ((isRegex && name.test(test)) || (!isRegex && name === test))
            );
        }

        // Turn on the spinner.
        const spinner = new Spinner({
            text: 'Making the requests %s',
            onTick: function onSpinnerTick(msg) {
                this.clearLine(this.stream);
                this.stream.write(chalk.dim(msg));
            },
        });
        spinner.start();
        // Run all the tests!
        return Promise.all(list.map((test) => {
            // Enqueue all the iterations for the current test.
            const iterationsPromises = [];
            for (let i = 0; i < this.iterations; i++) {
                iterationsPromises.push(this._runTest(test));
            }

            return Promise.all(iterationsPromises);
        }))
        .catch((error) => {
            // Something failed, turn off the spinner before resending the rejection.
            spinner.stop(true);
            return Promise.reject(error);
        })
        .then(() => {
            // Yay! Nothing happen, turn off the spinner and send the reference.
            spinner.stop(true);
            return this;
        });
    }
    /**
     * Run a single test. It will execute the test file using `shelljs` and based on the output it
     * will either add it to the results or reject the returned Promise.
     * @param {String} name The test name. It should exists as a key on the `this.tests`
     *                       dictionary.
     * @return {Promise<undefined,Error>} If everything goes well, the result of the test will
     *                                    automatically be added to the `this.results` Object and
     *                                    the Promise will be resolved without any parameter.
     * @ignore
     */
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
                        let success = true;
                        try {
                            this._addResultOutput(name, stdout);
                        } catch (error) {
                            reject(error);
                            success = false;
                        }
                        if (success) {
                            resolve();
                        }
                    } else {
                        reject(stderr.trim());
                    }
                }
            );
        });
    }
    /**
     * The _"real show method"_. It takes all the processed information from `showResults` and
     * print the report on the console.
     * @param {Object} results A dictionary with all the tests information.
     * @ignore
     */
    _output(results) {
        // Let's sort the tests name.
        const testNames = Object.keys(results).sort();
        // Because `\t` takes too much space :P.
        const tab = '    ';
        // A list with all the lines that will be shown.
        const lines = [''];
        // Add some title info...
        lines.push(chalk.underline.bold('HTTP Speed Meter - Average Results\n'));
        lines.push(chalk.dim(`${tab}Target URL: ${this.url}`));
        lines.push(chalk.dim(`${tab}Iterations: ${this.iterations}\n`));
        /**
         * This will store each result row label by its test name. The reason I first store
         * them and then print them on another loop it's because I need to know which is the
         * longest label in order to calculate where the bars should start.
         */
        const labels = {};
        /**
         * This will be the length of the longest label and the column in which the bars will
         * start printing.
         */
        let startBarsAt = 0;
        /**
         * Loop all the tests, build the test labels and check which one is the longest.
         */
        testNames.forEach((testName) => {
            const { info } = results[testName];
            const label = `${tab}${info.name}@${info.version}  `;
            if (label.length > startBarsAt) {
                startBarsAt = label.length;
            }

            labels[testName] = label;
        });
        /**
         * Here's one thing I didn't mention anywhere else: Even if you extended `HsmTest` and added
         * new formats and you are also returning it on the test JSON. If the key for that type is
         * not on the `this.normalizedNames` dictionary, it will never show up on the output :P.
         */
        Object.keys(this.normalizedNames).forEach((formatName) => {
            // Add the type title.
            const title = this.normalizedNames[formatName];
            const titleLine = chalk.underline.bold(`Test: ${title}\n`);
            lines.push(`${tab}${titleLine}`);
            /**
             * Loop all the tests again, but now print the labels and the bars.
             */
            testNames.forEach((testName) => {
                const time = results[testName].times[formatName];
                const limit = startBarsAt + time.width;
                let newLabel = labels[testName];
                for (let i = newLabel.length; i < limit; i++) {
                    newLabel += i < startBarsAt ? ' ' : '█';
                }

                newLabel += ` ${time.time}`;

                lines.push(chalk[this._getColor()](newLabel));
            });
            // Empty blank link.. because of reasons.
            lines.push('\n');
        });

        // eslint-disable-next-line no-console
        lines.forEach(line => console.log(line));
    }
    /**
     * Get a `chalk` color to use on the output. This method uses an internal counter in order to
     * give you a new one from the `this.colors` list each time it's called. If it runs out of
     * colors, it will start from the first one again.
     * @return {String} A color name.
     * @ignore
     */
    _getColor() {
        this._currentColorsIndex++;
        if (!this.colors[this._currentColorsIndex]) {
            this._currentColorsIndex = 0;
        }

        return this.colors[this._currentColorsIndex];
    }
    /**
     * Get the necessary information to show a request type on the screen.
     * @param {String} name    The request type.
     * @param {Number} value   The request time (in ms).
     * @param {Number} highest The highest time (in ms) to calculate the width percentage.
     * @return {Object} The request type infromation.
     * @property {Number} width The number of columns the bar should have.
     * @property {String} title The normalized title for the request type.
     * @property {Number} raw   The received time value, in ms.
     * @property {String} time  The receivd time time, in _human-readable_ format.
     * @ignore
     */
    _formatRequest(name, value, highest) {
        const percentage = Math.floor((value * 100) / highest);
        const width = Math.floor((this.maxColumns / 100) * percentage);
        return {
            width,
            title: this.normalizedNames[name],
            raw: value,
            time: prettyMs(value),
        };
    }
    /**
     * Get a package information from its `package.json`
     * @param {String} depName The package name.
     * @return {Object} A dictionary with the basic information.
     * @property {String} name       The name of the package's according to its `package.json`.
     * @property {String} version    The package version.
     * @property {String} repository The package repository URL.
     * @throws {Error} If the dependency is not present on this project `dependencies`.
     * @ignore
     */
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
    /**
     * Add the results from one tests to the main `this.results` dictionary.
     * @param {String} test      The test name.
     * @param {String} rawOutput The JSON encoded output returned by the test.
     * @ignore
     */
    _addResultOutput(test, rawOutput) {
        if (!this.results[test]) {
            this.results[test] = [];
        }

        this.results[test].push(JSON.parse(rawOutput.trim()));
    }
    /**
     * Find all the test files on the directory sent to the constructor.
     * @return {Object} A dictionary with a extension-less filenames as keys and the absolute paths
     *                  as values.
     */
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
    /**
     * Given a path for a mock file, this method will try to read it, parse it and overwrite the
     * main `this.results` dictionary with its values.
     * @param {String} filepath The path to the mock file. Relative to where you are running the
     *                          script
     * @return {Boolean} Whether or not the results were mocked.
     * @throws {Error} If The file can't be found or its contents are not valid JSON.
     */
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
/**
 * @ignore
 */
module.exports = HsmTester;
