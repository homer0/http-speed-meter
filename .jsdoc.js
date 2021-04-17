const packageJson = require('./package.json');

module.exports = {
  source: {
    include: ['./src'],
    includePattern: '.js$',
  },
  plugins: ['docdash/nativeTypesPlugin', 'plugins/markdown'],
  templates: {
    cleverLinks: true,
    default: {
      includeDate: false,
    },
  },
  opts: {
    recurse: true,
    destination: './docs',
    readme: 'README.md',
    template: 'node_modules/docdash',
  },
  docdash: {
    title: packageJson.name,
    meta: {
      title: `${packageJson.name} docs`,
    },
    sectionOrder: [],
    collapse: true,
  },
};
