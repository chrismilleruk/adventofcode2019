const { NetworkedComputerWorker, NetworkedComputer, Network } = require('./networkedComputer');
const { createStreamFromFile } = require('../lib/createStream');

const filename = __dirname + '/input.txt';
const chalk = require('chalk');

const { Worker, isMainThread, workerData } = require('worker_threads');
const workerFilename = __dirname + '/ncWorker.js';

if (require.main === module) {
  (async () => {
    try {
      await part1();
      await part2();

    } catch (ex) {
      console.error(ex);
    }
  })();
}

async function part1() {
  console.log(chalk.yellowBright(`Part 1?`));
  let t0 = Date.now();

  let result = -1;

  const workers = [];

  const getMessageHandler = (fromAddr) => { 
    const onMessage = ([toAddr, x, y]) => {
      console.log(fromAddr, '>', toAddr, '(', x, y, ')');

      if (toAddr === 255) {
        result = [x, y];
        return;
      }

      // if (!workers[toAddr]) {
      //   console.log('booting', toAddr);
      //   workers[toAddr] = new NetworkedComputerWorker(toAddr, getMessageHandler(toAddr));
      // }

      workers[toAddr].sendMessage(x, y);
    }
    return onMessage;
  }

  for (let id = 0; id < 50; id ++) {
    workers[id] = new NetworkedComputerWorker(id, getMessageHandler(id));
  }

  // Allow some time for the result to come out.
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Kill workers.');
  // Kill all workers
  const terminatingWorkers = workers.map((worker) => {
    if (worker && worker.terminate) {
      return worker.terminate();
    }
  });
  await Promise.all(terminatingWorkers);
  console.log('- terminated.');
  
  // let result = -1;
  console.log('Part 1?', result, (result[1] === 17849) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}

async function part2() {
  console.log(chalk.yellowBright(`Part 2?`));
  let t0 = Date.now();

  let result = -1;
  console.log('Part 2?', result, (result === 0) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}
