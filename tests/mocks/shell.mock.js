class ShellJSMock {
  constructor() {
    this.commands = [];
    this.callbacks = [];
    this._callbacksIndex = -1;
  }

  addExecCallback(code = 0, stdout = '', stderr = '') {
    if (Array.isArray(code)) {
      code.forEach((call) => {
        this.addExecCallback(call.code || 0, call.stdout || '', call.stderr || '');
      });
    } else {
      this.callbacks.push({
        code,
        stdout,
        stderr,
      });
    }
  }

  exec(command, options, callback) {
    this._callbacksIndex++;
    if (!this.callbacks[this._callbacksIndex]) {
      throw new Error('Unexpected call to `exec`');
    }

    this.commands.push(command);
    const { code, stdout, stderr } = this.callbacks[this._callbacksIndex];
    callback(code, stdout, stderr);
  }

  reset() {
    this.commands.length = 0;
    this.callbacks.length = 0;
    this._callbacksIndex = -1;
  }
}

module.exports = new ShellJSMock();
