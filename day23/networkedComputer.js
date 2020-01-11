
const { loadIntcodeFile } = require('../lib/loadIntcode');
const { executeProgramAsGenerator } = require('../lib/intCodeComputer')

class NetworkedComputer {
  // /**
  //  * 
  //  * @param {string} programFilename Filename for the intcode source.
  //  */
  // constructor(programFilename) {
  //   this._filename = programFilename
  // }

  /**
   * 
   * @param {array<number>} program intcode array.
   */
  constructor(program) {
    this._program = program
  }

  /**
   * Initialise the networked computer.
   * @param {Number} address The network address of this computer.
   * @param {(address:Number, X:Number, Y:Number)=> void onMessageSend Called whenever this computer sends a message. 
   */
  async init(address = 0, onMessageSend) {
    this.address = address;
    this.onMessage = onMessageSend;
    this.onInputBufferAdd = () => {};
    this.onOutputBufferAdd = () => {};

    this.inputBuffer = [address];
    this.outputBuffer = [];

    // const program = await loadIntcodeFile(this._filename);
    // this._program = program;
    // this._generator = executeProgramAsGenerator(program, this._inputFn);
  }

  /**
   * Returns a promise which resolves once the input buffer is no longer empty.
   * @param {Number?} length Optionally wait for a minimum length before resuming.
   */
  async waitForInputBuffer(length = 1) {
    this.waitForInputBuffer.waiting = true;
    const executor = (resolve) => {
      this.onInputBufferAdd = () => {
        if (this.inputBuffer.length >= length) {
          this.waitForInputBuffer.waiting = false;
          resolve();
        }
      };
    };

    return new Promise(executor)
  }

  /**
   * Returns a promise which resolves once the output buffer is no longer empty.
   * @param {Number?} length Optionally wait for a minimum length before resuming.
   */
  async waitForOutputBuffer(length = 1) {
    this.waitForOutputBuffer.waiting = true;
    const executor = (resolve) => {
      this.onOutputBufferAdd = () => {
        if (this.outputBuffer.length >= length) {
          this.waitForOutputBuffer.waiting = false;
          resolve();
        }
      };
    };

    return new Promise(executor)
  }

  /**
   * Receives a message from another networked computer.
   * @param  {...any} inputs Message contents.
   */
  receive(...inputs) {
    this.inputBuffer = this.inputBuffer.concat(inputs);
    this.onInputBufferAdd();
    // console.log(this.address, this.inputBuffer);
  }

  /**
   * Runs the networked computer (don't use await, may never finish).
   */
  async run() {
    for await (const output of executeProgramAsGenerator(this._program, this._inputFn.bind(this))) {
      this.outputBuffer.push(output);
      output;/*?*/
      this.onOutputBufferAdd();
    
      if (this.outputBuffer.length >= 3) {
        let triple = this.outputBuffer.splice(0, 3);
        this.onMessage(...triple);
      }
    }
  }

  /**
   * The input function passed to the int code computer.
   */
  async _inputFn() {
    // Breathe
    await new Promise(setImmediate);

    if (this.inputBuffer.length === 0) {
      // console.log(this.address, 'input empty');
      return -1;
      // await this.waitForInputBuffer();
    }

    const input = this.inputBuffer.shift();
    return input;
  }
}

class Network {
    constructor(size) {

    }
}


const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

class NetworkedComputerWorker extends Worker {
  constructor(address, onMessage, filename = __dirname + '/input.txt') {
    super(__filename, { workerData: { address: address, filename: filename } });

    this._address = address;

    this.on('message', onMessage);
  }

  get address() {
    return this._address;
  }

  sendMessage(...args) {
    this.postMessage(args);
  }
}

if (isMainThread) {
  module.exports = { NetworkedComputer, Network, NetworkedComputerWorker }
} else {
  // console.debug('EHLO', workerData.address);

  if (workerData.address < 250) {
    (async function() {
      const program = await loadIntcodeFile(workerData.filename);
      const nc = new NetworkedComputer(program);

      const onMessageSend = (...args) => {
        // console.debug('<', workerData.address, ...args);
        parentPort.postMessage(args);
      };

      parentPort.on('message', (args) => {
        // console.debug('>', workerData.address, ...args);
        nc.receive(...args);
      })

      await nc.init(workerData.address, onMessageSend);
      await nc.run();
    })()
  }
}
