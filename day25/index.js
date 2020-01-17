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

  const readLine = async (state) => {
    // console.log(state);

    const choices = getChoices(state);
    try {
      const choice = await getChoice(choices, rl);
      return choice.command();
    } catch (ex) {
      return new Promise((resolve) => {
        rl.question('>', (answer) => {
          rl.pause();
          console.log(chalk.red(answer));
          resolve(answer)
        });
      })
    }
  }

  const writeLine = (line, state, emoji = '') => {
    console.log(emoji, line)
  }

  let result = await game.interactiveMode(writeLine, readLine);

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

function getChoices(state) {
  let choices = [];
  // {title: '', command: () => ''}
  // {
  //   inv: [ 'sand' ],
  //   room: 'Arcade',
  //   items: [],
  //   doors: [ 'north', 'south' ]
  // }

  for (const doorName of state.doors) {
    choices.push({
      title: `Go ${doorName}`, 
      command: () => doorName
    })
  }

  for (const itemName of state.items) {
    choices.push({
      title: `Take ${itemName}`, 
      command: () => `take ${itemName}`
    })
  }

  for (const itemName of state.inv) {
    choices.push({
      title: `Drop ${itemName}`, 
      command: () => `drop ${itemName}`
    })
  }

  const freetext = {
    title: 'type command',
    command: () => new Promise((resolve) => {
      rl.question('>', (answer) => {
        rl.pause();
        console.log(chalk.red(answer));
        resolve(answer)
      });
    })
  }
  choices.push(freetext);

  return choices;

}