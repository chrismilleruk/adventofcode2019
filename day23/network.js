const { NetworkedComputerWorker } = require('./networkedComputer');
const EventEmitter = require('events');

class Network extends EventEmitter {
  constructor(size) {
    super();
    this._size = size;
    this.workers = Array(size).fill(false);
    this.idle = Array(size).fill(false);
    this.natQueue = [];

    const getMessageHandler = (fromAddr) => { 
      const onMessage = (toAddr, x, y) => {
        this.emit('message', fromAddr, toAddr, x, y);
        // console.log(fromAddr, '>', toAddr, '(', x, y, ')');

        if (toAddr === 255) {
          this.natQueue.push([x, y]);
          return;
        }
        if (toAddr < this._size) {
          this.workers[toAddr].sendMessage(x, y);
        }
      }
      return onMessage;
    }

    // Start all the workers.
    for (let id = 0; id < this._size; id ++) {
      this.workers[id] = new NetworkedComputerWorker(id, getMessageHandler(id));
      this.workers[id].on('idle', (addr, idleSince) => {
        this.idle[id] = idleSince;
      });
      this.workers[id].on('busy', (addr, idleSince) => {
        this.idle[id] = false;
      });
    }
  }

  async runToIdle(timeout = 4000) {
    // Wait for the network to idle & have sent a result to address 255.
    await new Promise(resolve => {
      const interval = setInterval(() => {
        let busyWorkers = this.idle.filter((v) => !v);
        // [busyWorkers.length, this.natQueue.length];/*?*/
        if (busyWorkers.length === 0 && this.natQueue.length > 0) {
          resolve();
          clearInterval(interval);
        }
      }, 100);
      setTimeout(resolve, timeout);
    });
  }

  async kill() {
    // Kill all workers
    const terminatingWorkers = this.workers.map((worker) => {
      if (worker && worker.terminate) {
        return worker.terminate();
      }
    });
    await Promise.all(terminatingWorkers);
  }
}

module.exports = { Network }