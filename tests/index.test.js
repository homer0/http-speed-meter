jest.unmock('../src/index.js');

const index = require('../src');
const HsmTester = require('../src/lib/hsmTester');

describe('Index file', () => {
  it('should export the main classes of the package', () => {
    expect(index.HsmTester).toEqual(HsmTester);
  });
});
