const { Network } = require('./network');
const chalk = require('chalk');

if (require.main === module) {
  (async () => {
    try {
      await part1();
      await part2();

    } catch (ex) {
      console.error(ex);
      process.exit();
    }
  })();
}

async function part1() {
  console.log(chalk.yellowBright(`Boot up all 50 computers and attach them to your network. `));
  let t0 = Date.now();

  let result = -1;

  const network = new Network(50);
  // network.on('message',(fromAddr, toAddr, x, y) => {
  //   console.log(fromAddr, '>', toAddr, '(', x, y, ')');
  // });
  await network.runToIdle();

  result = network.natQueue[0];

  await network.kill();

  console.log('What is the Y value of the first packet sent to address 255?', result, (result[1] === 17849) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}

async function part2() {
  console.log(chalk.yellowBright(`Monitor packets released to the computer at address 0 by the NAT.`));
  let t0 = Date.now();

  let result = -1;
  let previous = [];
  let seen = new Set();
  let next = [];
  let maxIterations = 10000;

  const network = new Network(50);
  
  let i = 1;
  while (maxIterations--) {
    await network.runToIdle();

    next = network.natQueue[network.natQueue.length -1];
    if (!next) throw 'nothing next';
    console.log(i++, ...next);
    network.workers[0].sendMessage(next[0], next[1]);

    if (seen.has(next[1])) {
    // if (next[1] === previous[1]) {
      result = next[1];
      break;
    }
    seen.add(next[1]);
    previous = next;
  }

  await network.kill();


  console.log('What is the first Y value delivered by the NAT to the computer at address 0 twice in a row?', result, (result === 12235) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}
