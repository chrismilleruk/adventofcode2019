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

  let count = 0;

  const ratingsAlreadySeen = new Set();

  while (!ratingsAlreadySeen.has(emulator.biodiversityRating) ) {
    ratingsAlreadySeen.add(emulator.biodiversityRating);
    emulator.step();
    count += 1;
  }

  let result = emulator.biodiversityRating;

  console.log('First layout that appears twice:', result, (result === 32505887) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}

async function part2() {
  console.log(chalk.yellowBright(`Part 2?`));
  let t0 = Date.now();

  let result = -1;
  console.log('Part 2?', result, (result === 0) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}
