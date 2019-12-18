const readline = require('readline');
const chalk = require('chalk');

async function getChoice(choices) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    // Print options
    choices.forEach((choice, index) => {
      console.log(index + 1, choice.title);
    });

    rl.question('Select: ', (inputString) => {
      rl.close();

      let input = parseInt(inputString, 10);
      let choice = choices[input - 1];
      if (choice) {
        readline.moveCursor(rl.input, 0, -1 * choices.length - 1);
        readline.clearScreenDown(rl.input);
        console.log(chalk.green(choice.title));
        resolve(choice);
      }
      reject(`Choice ${inputString} not found`);
    });
  });
}

module.exports = { getChoice };
