const { AdventureGame } = require('./adventureGame');

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
  console.log(chalk.yellowBright(`Part 1?`));
  console.log(chalk.yellowBright(`Collect items: semiconductor, ornament, space heater, festive hat`));
  let t0 = Date.now();

  //"Oh, hello! You should be able to get in by typing 25165890 on the keypad at the main airlock."
  const game = await AdventureGame.fromFile(filename);
  
  const writeLine = (line, state, emoji = '') => {
    console.log(emoji, line)
  }

  const result = await game.interactiveMode(writeLine);

  // Your puzzle answer was 25165890.
  console.log('Code for the main airlock.', result.airlockCode, (result.airlockCode === '25165890') ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}

async function part2() {
  console.log(chalk.yellowBright(`Part 2?`));
  let t0 = Date.now();

  let result = -1;
  console.log('Part 2?', result, (result === 0) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}
