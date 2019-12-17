const { createStreamFromFile, createStreamFromString } = require('../lib/createStream');
const { Moon, MoonSystem } = require('./moonCalculator');

const readline = require('readline');
const chalk = require('chalk');

const filename = __dirname + '/input.txt';

const configs = [
  {
    title: 'Example 1',
    createStream: () => createStreamFromString(`
    <x=-1, y=0, z=2>
    <x=2, y=-10, z=-7>
    <x=4, y=-8, z=8>
    <x=3, y=5, z=-1>`),
    energy: { steps: 10, totalEnergy: 179 },
    periods: { system: 2772, x: 18, y: 28, z: 44 },
    axisSearchUpperLimit: 100
  },
  {
    title: 'Example 2',
    createStream: () => createStreamFromString(`
    <x=-8, y=-10, z=0>
    <x=5, y=5, z=10>
    <x=2, y=-7, z=3>
    <x=9, y=-8, z=-3>`),
    energy: { steps: 100, totalEnergy: 1940 },
    periods: { system: 4686774924, x: 2028, y: 5898, z: 4702 },
    axisSearchUpperLimit: 6000
  },
  {
    title: 'Puzzle Input',
    createStream: () => createStreamFromFile(filename),
    energy: { steps: 1000, totalEnergy: 9958 },
    periods: { system: 318382803780324, x: 28482, y: 231614, z: 193052 },
    axisSearchUpperLimit: 1000000
  },
];

const actions = [
  {
    title: 'Total Energy in the system after N steps',
    execute: async (config) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const moonSystem = await MoonSystem.parseStream(config.createStream());

      return new Promise((resolve, reject) => {
        rl.question('Steps ' + chalk.grey(`(default: ${config.energy.steps})`) + ':', (inputString) => {
          rl.close();
          let input = inputString.trim() === '' ? config.energy.steps : parseInt(inputString, 10);
          moonSystem.step(input);

          console.log(chalk.green('Total Energy:'), moonSystem.totalEnergy,
            (moonSystem.totalEnergy === config.energy.totalEnergy) ? '🏆' : '❌');

          resolve();
        });
      });

    }
  },
  {
    title: 'Steps to reach state that exactly matches initial state',
    execute: async (config) => {
      const t0 = Date.now();
      const moonSystem = await MoonSystem.parseStream(config.createStream());

      let periods = moonSystem.findAxisRepeatPeriods(config.axisSearchUpperLimit);
      console.log(`Found period (x)`, periods.x,
        (periods.x === config.periods.x) ? '🏆' : '❌');
      console.log(`Found period (y)`, periods.y,
        (periods.y === config.periods.y) ? '🏆' : '❌');
      console.log(`Found period (z)`, periods.z,
        (periods.z === config.periods.z) ? '🏆' : '❌');
      periods = moonSystem.findSystemRepeatPeriod(periods);
      console.log(`Found system period`, periods.system,
        (periods.system === config.periods.system) ? '🏆' : '❌');
      
      console.log(chalk.grey('Time taken:'), Date.now() - t0, chalk.yellow('ms'));
    }
  }
]

if (require.main === module) {
  (async () => {
    console.log(chalk.yellowBright('Part 1. What is the total energy in the system after simulating the moons given in your scan for 1000 steps?'));
    console.log(chalk.yellowBright('Part 2. How many steps does it take to reach the first state that exactly matches a previous state?'));

    try {
      const config = await getChoice(configs);
      const action = await getChoice(actions);

      await action.execute(config);

      console.log('');

    } catch (ex) {
      console.error(chalk.bgRed(ex));
    }

  })();
}

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
module.exports = {
};
