/* eslint-disable jsdoc/require-jsdoc */
export const LIBS = ['pretty-ms', 'chalk', 'node-fetch', 'got', 'ky'];
const libsModules = {};

export const loadESMLibs = () =>
  Promise.all(
    LIBS.map(async (lib) => {
      libsModules[lib] = await import(lib);
    }),
  );

export const getLib = (lib) => libsModules[lib];
