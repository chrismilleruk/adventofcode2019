const { LockedMazeRunner } = require('./lockedMazeRunner')
const { createStreamFromFile } = require('../lib/createStream')
// const { preparePlotArea, plotPanelAsBlock } = require('../lib/render');

const filename = __dirname + '/input.txt';
const readlineSync = require('readline-sync')
const chalk = require('chalk');

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
  console.log(chalk.yellowBright(`How many steps is the shortest path that collects all of the keys?`));
  let t0 = Date.now();

  const linesAsync = createStreamFromFile(filename)
  const maze = await LockedMazeRunner.parse(linesAsync);

  maze.linkTiles();
  const fromState = '';
  const toState = maze.keyChars;

  let shortestDistance = Infinity;
  for await (const char of maze.keyChars)
  {
    let distance = maze.shortestDistance('@', char, fromState, toState);
    console.log(`Distance from @ to ${char}`, distance, (distance < shortestDistance) ? '🏆' : '❌');
    shortestDistance = Math.min(distance, shortestDistance);
  }

  console.log('Shortest Distance', shortestDistance, (shortestDistance === 4204) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}

async function part2() {
  // console.log(chalk.yellowBright(`Find the 100x100 square closest to the emitter that fits entirely within the tractor beam`));
  // let t0 = Date.now();

  
  // console.log('Find the point closest to the emitter', coord); //, (coord === [877, 1057]) ? '🏆' : '❌');
  // let result = coord[0] * 10000 + coord[1];
  // console.log('X coordinate, multiply it by 10000, then add Y coordinate', result, (result === 8771057) ? '🏆' : '❌');
  // console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}
