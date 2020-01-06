const { loadIntcodeFile } = require('../lib/loadIntcode');
const { executeProgramAsGenerator } = require('../lib/intCodeComputer')

class SpringDroid {
  constructor(filename) {
    this._filename = filename;

    this._logMode = SpringDroid.MODE_INPUT;
    this._logHistory = [];
    this._log = [];
    this._logHistory.push(this._log);
  }

  async loadSpringScript(springScript) {
    this._script = springScript;
    this._input = 'NOT D J\n'
    this._intcode = await loadIntcodeFile(this._filename);
  }

  async walk() {
    this._input += 'WALK\n';
    this._inputBuffer = this._input.split('');

    const inputFn = () => {
      const input = this._inputBuffer.shift();
      this.logInput(input.charCodeAt(0));
      return input;
    }
    const outputs = [];

    for await (let output of executeProgramAsGenerator(this._intcode.slice(), inputFn)) {
      outputs.push(output);
      this.logOutput(output);
    }

    this._result = outputs;
  }

  setLogMode(logMode) {
    if (this._logMode !== logMode) {
      this._logMode = logMode;

      this._log = [];
      this._logHistory.push(this._log);

      if (logMode === SpringDroid.MODE_OUTPUT) {
        this._output = this._log;
      }
    }
  }

  logInput(ch) {
    this.setLogMode(SpringDroid.MODE_INPUT);
    this._log.push(ch);
  }

  logOutput(ch) {
    this.setLogMode(SpringDroid.MODE_OUTPUT);
    this._log.push(ch);
  }

  result() {
    return this._result[0];
  }

  lastMoments() {
    return this._result.map(ch => String.fromCharCode(ch)).join('');
  }

  log() {
    return this._logHistory.map((chars, i) => {
      let line = chars.map(ch => String.fromCharCode(ch)).join('');
      return i % 2 ? '>' + line : line;
    }).join('\n')
  }
}

SpringDroid.MODE_INPUT = 'INPUT';
SpringDroid.MODE_OUTPUT = 'OUTPUT';

module.exports = { SpringDroid };