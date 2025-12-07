import { defineConfig } from 'eslint/config';
import { createConfig } from '@homer0/eslint-plugin/create';

export default defineConfig([
  createConfig({
    importUrl: import.meta.url,
    ignores: ['tests/**', 'src/tests/**'],
    configs: ['node-with-prettier', 'jsdoc'],
    esm: true,
    addTsParser: false,
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  }),
  createConfig({
    importUrl: import.meta.url,
    files: ['all-inside:src/tests'],
    configs: ['node-with-prettier'],
    esm: true,
    addTsParser: false,
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  }),
  createConfig({
    importUrl: import.meta.url,
    files: 'all-inside:./tests',
    configs: ['node-with-prettier', 'tests'],
    esm: true,
    addTsParser: false,
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-use-before-define': 'off',
    },
  }),
]);
