import { expect, describe, it } from 'vitest';
import * as index from '../src/index.js';
import { HsmTester } from '../src/lib/hsmTester.js';

describe('Index file', () => {
  it('should export the main classes of the package', () => {
    expect(index.HsmTester).toEqual(HsmTester);
  });
});
