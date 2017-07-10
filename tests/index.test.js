jest.unmock('/src/index.js');
jest.unmock('/src/lib/*.js');

require('jasmine-expect');
const index = require('/src/index');
const HsmTester = require('/src/lib/hsmTester');

describe('Index file', () => {
    it('should export the main classes of the package', () => {
        expect(index.HsmTester).toBeFunction();
        expect(index.HsmTester).toEqual(HsmTester);
    });
});
