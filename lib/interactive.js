const readline = require('readline');
const chalk = require('chalk');

async function getChoice(choices, readLineInterface) {
  const rl = readLineInterface || readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    const choiceMap = new Map();
    let idx = 1;
    // Print options
    choices.forEach((choice, index) => {
      let key = '' + (choice.key || idx++);
      choiceMap.set(key, choice);
      console.log(key, choice.title);
    });

    rl.question('Select: ', (inputString) => {
      rl.pause();

      // let input = parseInt(inputString, 10);
      // let choice = choices[input - 1];
      let choice = choiceMap.get(inputString)

      readline.moveCursor(rl.input, 0, -1 * choices.length - 1);
      readline.clearScreenDown(rl.input);

      if (choice) {
        console.log(chalk.green(choice.title));
        resolve(choice);
      } else {
        console.log(chalk.red(`Did not understand ${inputString}`));
        reject(`Choice ${inputString} not found`);
      }
    });
  });
}

module.exports = { getChoice };
