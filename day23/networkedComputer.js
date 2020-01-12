
const { loadIntcodeFile } = require('../lib/loadIntcode');
const { executeProgramAsGenerator } = require('../lib/intCodeComputer')

/* ignore coverage since this is only used inside the worker. */
class NetworkedComputer {
  /**
   * 
   * @param {array<number>} program intcode array.
   */
  constructor(program) {
    this._program = program
  }

  static get messageType() {
    return {
      'MESSAGE': -1,
      'IDLE': -2,
      'BUSY': -3
    };
  }

  /**
   * Initialise the networked computer.
   * @param {Number} address The network address of this computer.
   * @param {(messageType:Number, address:Number, X:Number, Y:Number) => void} sendMessage Called whenever this computer sends a message. 
   */
  async init(address = 0, sendMessage) {
    this.address = address;

    this.onMessage = (...args) => { 
      sendMessage(NetworkedComputer.messageType.MESSAGE, ...args); 
    };

    this.idleSince = 0;
    this.onIdle = (isIdle) => { 
      if (isIdle && this.idleSince === 0) {
        this.idleSince = Date.now();
        sendMessage(NetworkedComputer.messageType.IDLE, address, Date.now());
      }

      if (!isIdle && this.idleSince) {
        this.idleSince = 0;
        sendMessage(NetworkedComputer.messageType.BUSY, address, Date.now()); 
      }
    };

    this.onInputBufferAdd = () => {};
    this.onOutputBufferAdd = () => {};

    this.inputBuffer = [address];
    this.outputBuffer = [];
  }

  // /**
  //  * Returns a promise which resolves once the input buffer is no longer empty.
  //  * @param {Number?} length Optionally wait for a minimum length before resuming.
  //  */
  // async waitForInputBuffer(length = 1) {
  //   this.waitForInputBuffer.waiting = true;
  //   const executor = (resolve) => {
  //     this.onInputBufferAdd = () => {
  //       if (this.inputBuffer.length >= length) {
  //         this.waitForInputBuffer.waiting = false;
  //         resolve();
  //       }
  //     };
  //   };

  //   return new Promise(executor)
  // }

  // /**
  //  * Returns a promise which resolves once the output buffer is no longer empty.
  //  * @param {Number?} length Optionally wait for a minimum length before resuming.
  //  */
  // async waitForOutputBuffer(length = 1) {
  //   this.waitForOutputBuffer.waiting = true;
  //   const executor = (resolve) => {
  //     this.onOutputBufferAdd = () => {
  //       if (this.outputBuffer.length >= length) {
  //         this.waitForOutputBuffer.waiting = false;
  //         resolve();
  //       }
  //     };
  //   };

  //   return new Promise(executor)
  // }

  /**
   * Receives a message from another networked computer.
   * @param  {...any} inputs Message contents.
   */
  receive(...inputs) {
    this.inputBuffer = this.inputBuffer.concat(inputs);
    this.onInputBufferAdd();
  }

  /**
   * Runs the networked computer (don't use await, may never finish).
   */
  async run() {
    for await (const output of executeProgramAsGenerator(this._program, this._inputFn.bind(this))) {
      this.outputBuffer.push(output);
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
      // Slow down when idle.
      this.onIdle(true);
      await new Promise(resolve => setTimeout(resolve, 20)); 
      return -1;
    }

    this.onIdle(false);
    const input = this.inputBuffer.shift();
    return input;
  }
}

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

class NetworkedComputerWorker extends Worker {
  constructor(address, onMessage, filename = __dirname + '/input.txt') {
    super(__filename, { workerData: { address: address, filename: filename } });

    this._address = address;

    this.on('message', ([messageType, addr, x, y]) => {
      switch (messageType) {
        case NetworkedComputer.messageType.IDLE:
          this._idleTime = x;
          this.emit('idle', addr, this._idleTime);
          return;
        case NetworkedComputer.messageType.BUSY:
          this.emit('busy', addr, this._idleTime);
          this._idleTime = 0;
          return;
        case NetworkedComputer.messageType.MESSAGE:
          onMessage(addr, x, y);
          this.emit('network_message', addr, x, y);
          return;
        default:
          /* ignore coverage */
          throw `Unknown message type ${messageType}, ${addr}, ${x}, ${y}`
      }
    });
  }

  get address() {
    return this._address;
  }

  sendMessage(...args) {
    this.postMessage(args);
  }

  get idleTime() {
    return this._idleTime;
  }
}

if (isMainThread) {
  module.exports = { NetworkedComputer, NetworkedComputerWorker }
} else {
  // console.debug('EHLO', workerData.address);

  /* ignore coverage since this is only used inside the worker. */
  if (workerData.address < 255) {
    (async function() {
      const program = await loadIntcodeFile(workerData.filename);
      const nc = new NetworkedComputer(program);

      const sendMessage = (...args) => {
        // console.debug('<', workerData.address, ...args);
        parentPort.postMessage(args);
      };

      parentPort.on('message', (args) => {
        // console.debug('>', workerData.address, ...args);
        nc.receive(...args);
      })

      await nc.init(workerData.address, sendMessage);
      await nc.run();
    })()
  }
}
