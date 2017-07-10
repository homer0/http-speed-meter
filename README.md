# HTTP Speed Meter

[![Build Status](https://travis-ci.org/homer0/http-speed-meter.svg?branch=master)](https://travis-ci.org/homer0/http-speed-meter) [![Coverage Status](https://coveralls.io/repos/homer0/http-speed-meter/badge.svg?branch=master&service=github)](https://coveralls.io/github/homer0/http-speed-meter?branch=master)  [![Dependencies status](https://david-dm.org/homer0/http-speed-meter.svg)](https://david-dm.org/homer0/http-speed-meter) [![Dev dependencies status](https://david-dm.org/homer0/http-speed-meter/dev-status.svg)](https://david-dm.org/homer0/http-speed-meter#info=devDependencies)

This is very simple, I wanted to know which was the fastest HTTP client for Javascript. I went to Google and searched for something like _"Compare HTTP clients for Javascript"_ and I found [this page](https://npmcompare.com/compare/axios,got,request,reqwest,superagent). Pretty useful information about the projects, but nothing on performance and/or speed, but I took the list of _competitors_ and bookmarked it to get back later, after I run my tests.

## Usage

Since is not a dependency, I didn't publish it on NPM, so you'll have to clone or download the repository in order to try it.

Once you are done cloning/downloading, install the project dependencies:

```
npm install --production
```

> Use the `--production` argument to avoid installing the linting and testing dependencies.

Ok, now run it:

```
npm start
```

You should see something like this:

```
HTTP Speed Meter - Average Results

    Target URL: https://api.github.com/users/homer0/repos
    Iterations: 1

    Test: JSON

    superagent@3.5.2       █ 1.3s
    node-fetch@1.7.1       █ 1.4s
    request@2.81.0         ████ 1.9s
    axios@0.16.2           █████████████ 2.4s
    reqwest@2.0.5          █████████████████████ 2.9s
    request-promise@4.2.1  ███████ 2s
    got@7.1.0              █ 1.4s


    Test: Text

    superagent@3.5.2       █ 1.3s
    node-fetch@1.7.1       █ 1.6s
    request@2.81.0         ████████ 2.1s
    axios@0.16.2           ████████████████████████ 3s
    reqwest@2.0.5          ██████ 2s
    request-promise@4.2.1  █████████████████████████████████ 3.6s
    got@7.1.0              █████████████████████████████████████████████████████████████████████████ 5.9s
```

And that's all; yes, speed is not everything and you should also have in mind all the features a client/library may have, but for this test I wanted just to see which was the fastest.

## Options

I added a few options so you can play around

### Custom URL

By default, I relay on a Github URL, and even if the restriction for non-authenticated requests is 60 per hour, it was good enough for my tests; if you want to run the tests against a another URL, just send it as an argument of `npm start`:

```
npm start -- --url=http://batman-rulz.com
```

### Iterations

You may have noticed on the output title that it says _"Average"_ and _"Iterations"_, well, that's because you the result is the average time of all the iterations a test made. By default, the number of iterations is `1`, but like with the custom URL, you can send a parameter to overwrite it:

```
npm start -- --iterations=20
```

### Specific test

By default it runs all the tests it founds, but if you want to try just one, use the `--test` argument:

```
npm start -- --test=axios
```

## Development

First of all, install all the dependencies (if you haven't done it yet) and run `npm run install-hooks`, then:

- **If you want to add a new test:** Create a new file on `/src/tests` and follow the example of the other tests: The `test` and `testJSON` methods, the name getter and `.run()` your file at the end of the file. Don't forget to add the dependency on the `package.json`!.
- **If you want to modify the output/reporter:** There's an NPM task called `mock`, good to the `package.json` and take a look. It starts the process but with mocked results, so you don't have to make real requests while changing rainbow of output you are writing.

Finally, and I didn't mentioned earlier because the hooks are there for a reason, you have the `npm run link` and `npm test` for the linting and the unit tests.