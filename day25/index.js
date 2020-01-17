const { AdventureGame } = require('./adventureGame');
const { getChoice } = require('../lib/interactive');
const readline = require('readline');

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
  let t0 = Date.now();

  const game = await AdventureGame.fromFile(filename);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const readLine = async () => {
    return new Promise((resolve) => {
      // rl.prompt();
      rl.question('>', (answer) => {
        rl.pause();
        console.log(chalk.red(answer));
        resolve(answer)
      });
    });
  }

  let result = await game.interactiveMode(process.stdout, readLine);

  // let result = -1;
  console.log('Part 1?', result, (result === 0) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}

async function part2() {
  console.log(chalk.yellowBright(`Part 2?`));
  let t0 = Date.now();

  let result = -1;
  console.log('Part 2?', result, (result === 0) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}
