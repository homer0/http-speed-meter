import { vi } from 'vitest';

class SpinnerMockManager {
  constructor() {
    this.new = vi.fn();
    this.start = vi.fn();
    this.stop = vi.fn();
  }

  reset() {
    this.new.mockClear();
    this.start.mockClear();
    this.stop.mockClear();
  }
}

const manager = new SpinnerMockManager();

class SpinnerMock {
  constructor(options) {
    manager.new(options);
    this.start = manager.start;
    this.stop = manager.stop;
  }
}

manager.Spinner = SpinnerMock;

export default manager;
