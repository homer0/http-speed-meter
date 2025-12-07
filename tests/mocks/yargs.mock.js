class YargsMock {
  constructor() {
    this.argv = {};
  }

  reset() {
    Object.keys(this.argv).forEach((key) => {
      delete this.argv[key];
    });
  }

  setValues(values) {
    Object.keys(values).forEach((key) => {
      this.argv[key] = values[key];
    });
  }
}

export default new YargsMock();
