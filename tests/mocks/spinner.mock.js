class SpinnerMockManager {
  constructor() {
    this.new = jest.fn();
    this.start = jest.fn();
    this.stop = jest.fn();
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

module.exports = manager;
