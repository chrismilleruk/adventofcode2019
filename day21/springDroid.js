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
    this._input = springScript
      .split('\n')        // Split lines.
      .map(s => s.trim()) // Trim whitespace.
      .filter(s => s)     // Remove empty lines.
      .map(s => s + '\n') // All lines end in a newline.
      .join('');
    this._intcode = await loadIntcodeFile(this._filename);
  }

  async walk() {
    this._input += 'WALK\n';
    return this.go();
  }

  async run() {
    this._input += 'RUN\n';
    return this.go();
  }

  async go() {
    this._inputBuffer = this._input.split('').map(ch => ch.charCodeAt(0));

    const inputFn = () => {
      const input = this._inputBuffer.shift();
      this.logInput(input);
      return input;
    }
    const outputs = [];

    for await (let output of executeProgramAsGenerator(this._intcode.slice(), inputFn)) {
      outputs.push(output);
      this.logOutput(output);
    }

    this._result = outputs;
  }

  get result() {
    return this._output[this._output.length -1];
  }

  get lastMoments() {
    return this._output.map(ch => String.fromCharCode(ch)).join('');
  }

  get log() {
    return this._logHistory.map((chars, i) => {
      let line = chars.map(ch => String.fromCharCode(ch)).join('');
      return i % 2 ? '>' + line : line;
    }).join('\n')
  }

  setLogMode(logMode) {
    // If the output mode has changed, start a new line.
    if (this._logMode !== logMode) {
      this._logMode = logMode;

      this._log = [];
      this._logHistory.push(this._log);

      // Ensure we only capture the final output in `this._output`
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
}

SpringDroid.MODE_INPUT = 'INPUT';
SpringDroid.MODE_OUTPUT = 'OUTPUT';

module.exports = { SpringDroid };