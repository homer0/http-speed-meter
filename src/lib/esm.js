const LIBS = ['pretty-ms', 'chalk', 'node-fetch', 'got'];
const libsModules = {};

module.exports.loadESMLibs = () =>
  Promise.all(
    LIBS.map((lib) =>
      import(lib).then((module) => {
        libsModules[lib] = module;
      }),
    ),
  );

module.exports.getLib = (lib) => libsModules[lib];
