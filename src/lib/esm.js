module.exports.LIBS = ['pretty-ms', 'chalk', 'node-fetch', 'got'];
const libsModules = {};

module.exports.loadESMLibs = () =>
  Promise.all(
    module.exports.LIBS.map(async (lib) => {
      libsModules[lib] = await import(lib);
    }),
  );

module.exports.getLib = (lib) => libsModules[lib];
