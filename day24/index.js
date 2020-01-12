const { BugLife } = require('./bugLife');
const { createStreamFromFile } = require('../lib/createStream');

const filename = __dirname + '/input.txt';
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
  console.log(chalk.yellowBright(`What is the biodiversity rating for the first layout that appears twice?`));
  let t0 = Date.now();

  const linesAsync = createStreamFromFile(filename);
  const emulator = await BugLife.fromStream(linesAsync);

  const ratingsAlreadySeen = new Set();

  while (!ratingsAlreadySeen.has(emulator.biodiversityRating) ) {
    ratingsAlreadySeen.add(emulator.biodiversityRating);
    emulator.step();
  }

  let result = emulator.biodiversityRating;

  console.log('First layout that appears twice:', result, (result === 32505887) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}

async function part2() {
  console.log(chalk.yellowBright(`Starting with your scan, how many bugs are present after 200 minutes?`));
  let t0 = Date.now();

  const linesAsync = createStreamFromFile(filename);
  const emulator = await BugLife.fromStream(linesAsync);

  let count = 200;
  while (count--) {
    emulator.stepRecursive();
  }

  let result = emulator.totalBugs;
  console.log('Bugs present after 200 minutes:', result, (result === 1980) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}
