class YargsMock {

    constructor() {
        this.argv = {};
    }

    setValues(values) {
        Object.keys(values).forEach((key) => {
            this.argv[key] = values[key];
        });
    }

    reset() {
        // Object.keys(this.argv).forEach((key) => {
        //     delete this.argv[key];
        // });
    }
}

module.exports = new YargsMock();
