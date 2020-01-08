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

    for await (let output of executeProgramAsGenerator(this._intcode, inputFn)) {
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



class SpringScriptTester {
  constructor(springScript) {
    this._script = springScript;
    this._input = springScript
      .split('\n')        // Split lines.
      .map(s => s.trim()) // Trim whitespace.
      .filter(s => s)     // Remove empty lines.
      .join('\n');

    this.setGround();
  }

  get(ch) {
    if (ch >= 'A' && ch <= 'I') {
      let idx = ch.charCodeAt(0) - 'A'.charCodeAt(0);
      return this._ground[this._pos + idx] !== this._holeChar;
    }
    if (ch === 'T') {
      return this.TMP;
    }
    if (ch === 'J') {
      return this.JMP;
    }
  }

  set(ch, val) {
    if (ch === 'T') {
      this.TMP = !!val;
    }
    if (ch === 'J') {
      this.JMP = !!val;
    }
  }

  setGround(ground = '##########', holeChar = '.') {
    this._ground = ground + '##########';
    this._pos = 0;
    this._finish = ground.length;
    this._holeChar = holeChar;
    this.resetRegisters();
  }

  resetRegisters() {
    this.TMP = false;
    this.JMP = false;
  }

  get pos() {
    return this._pos;
  }

  get result() {
    return this._pos >= this._finish;
  }

  walk(ground) {
    this.setGround(ground);

    while (this._ground[this._pos - 1] !== this._holeChar && this._pos < this._finish) {
      this.resetRegisters();
      for (const line of this._input.split('\n')) {
        const [cmd, X, Y] = line.split(' ');
        let x, y, result;
        x = this.get(X);
        y = this.get(Y);

        switch (cmd) {
          case 'AND':
            // AND X Y sets Y to true if both X and Y are true; otherwise, it sets Y to false.
            result = (x & y) === 1;
            break;

          case 'OR':
            // OR X Y sets Y to true if at least one of X or Y is true; otherwise, it sets Y to false.
            result = (x | y) === 1;
            break;

          case 'NOT':
            // NOT X Y sets Y to true if X is false; otherwise, it sets Y to false.
            result = !x;
            break;
        }

        // [this._ground.slice(this._pos, this._pos + 4), line, cmd, X, x, Y, y, result];/*?*/
        this.set(Y, result);
      }

      // [this._input, this._pos, this._ground.slice(this._pos, this._pos + 4), this.TMP, this.JMP];/*?*/
      if (this.JMP) {
        this._pos += 4;
      } else {
        this._pos += 1;
      }
    }

    return this.result;
  }
}


module.exports = { SpringDroid, SpringScriptTester };