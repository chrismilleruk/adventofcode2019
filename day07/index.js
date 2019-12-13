const { loadIntcodeFile } = require('../lib/loadIntcode');
const {
  runAmplifySequence,
  findMaxAmplifySequence,
  runAmplifySequenceWithFeedback,
  findMaxAmplifySequenceWithFeedback
} = require('./amplifier');

const readline = require('readline');
const chalk = require('chalk');

const filename = __dirname + '/input.txt';

let configs = [
  {
    title: 'Part 1: Amplifier Controller Software. Try every combination of phase settings on the amplifiers. ',
    buffer: filename,
    phaseSettingSequence: [3, 2, 0, 1, 4],
    maxThrusterSignal: 212460,
    useFeedback: false
  },
  {
    title: 'Part 2: Try every combination of the new phase settings on the amplifier feedback loop.',
    buffer: filename,
    phaseSettingSequence: [8, 5, 9, 6, 7],
    maxThrusterSignal: 21844737,
    useFeedback: true
  },
  {
    title: 'Part 1: Max thruster signal 43210 (from phase setting sequence 4,3,2,1,0)',
    buffer: [3, 15, 3, 16, 1002, 16, 10, 16, 1, 16, 15, 15, 4, 15, 99, 0, 0],
    phaseSettingSequence: [4, 3, 2, 1, 0],
    maxThrusterSignal: 43210,
    useFeedback: false
  },
  {
    title: 'Part 1: Max thruster signal 54321 (from phase setting sequence 0,1,2,3,4)',
    buffer: [3, 23, 3, 24, 1002, 24, 10, 24, 1002, 23, -1, 23,
      101, 5, 23, 23, 1, 24, 23, 23, 4, 23, 99, 0, 0],
    phaseSettingSequence: [0, 1, 2, 3, 4],
    maxThrusterSignal: 54321,
    useFeedback: false
  },
  {
    title: 'Part 1: Max thruster signal 65210 (from phase setting sequence 1,0,4,3,2)',
    buffer: [3, 31, 3, 32, 1002, 32, 10, 32, 1001, 31, -2, 31, 1007, 31, 0, 33,
      1002, 33, 7, 33, 1, 33, 31, 31, 1, 32, 31, 31, 4, 31, 99, 0, 0, 0],
    phaseSettingSequence: [1, 0, 4, 3, 2],
    maxThrusterSignal: 65210,
    useFeedback: false
  },
  {
    title: 'Part 2: Max thruster signal 139629729 (from phase setting sequence 9,8,7,6,5)',
    buffer: [3, 26, 1001, 26, -4, 26, 3, 27, 1002, 27, 2, 27, 1, 27, 26,
      27, 4, 27, 1001, 28, -1, 28, 1005, 28, 6, 99, 0, 0, 5],
    phaseSettingSequence: [9, 8, 7, 6, 5],
    maxThrusterSignal: 139629729,
    useFeedback: true
  },
  {
    title: 'Part 2: Max thruster signal 18216 (from phase setting sequence 9,7,8,5,6)',
    buffer: [3, 52, 1001, 52, -5, 52, 3, 53, 1, 52, 56, 54, 1007, 54, 5, 55, 1005, 55, 26, 1001, 54,
      -5, 54, 1105, 1, 12, 1, 53, 54, 53, 1008, 54, 0, 55, 1001, 55, 1, 55, 2, 53, 55, 53, 4,
      53, 1001, 56, -1, 56, 1005, 56, 6, 99, 0, 0, 0, 0, 10],
    phaseSettingSequence: [9, 7, 8, 5, 6],
    maxThrusterSignal: 18216,
    useFeedback: true
  }
]

if (require.main === module) {
  (async () => {
    try {
      const config = await getConfig();
      const buffer = await (typeof config.buffer === "string" ? loadIntcodeFile(config.buffer) : config.buffer);

      const actions = ['Run Amplifier with best known Phase Setting Sequence',
        'Try every combination to find best Amplifier Phase Setting Sequence'];
      let input = await getAction(actions);

      if (input === 1) {
        let p = config.useFeedback ?
          runAmplifySequenceWithFeedback(buffer, config.phaseSettingSequence) :
          runAmplifySequence(buffer, config.phaseSettingSequence);
        const result = await p;
        console.log('Thruster Signal', result);
        console.log('Max', config.maxThrusterSignal, (result === config.maxThrusterSignal) ? '🏆' : '❌');
      } else if (input === 2) {
        let p = config.useFeedback ?
          findMaxAmplifySequenceWithFeedback(buffer) :
          findMaxAmplifySequence(buffer);
        const result = await p;
        console.log('Winning Thruster Signal', result.max);
        console.log('Best', config.maxThrusterSignal, (result.max === config.maxThrusterSignal) ? '🏆' : '❌');
        console.log('Winning Phase Setting Sequence', result.sequence);
        console.log('Best', config.phaseSettingSequence, (config.phaseSettingSequence.every((best, idx) => best === result.sequence[idx])) ? '🏆' : '❌');
      }
    } catch (ex) {
      console.error(ex);
    }
  })();
}


async function getConfig() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve, reject) => {
    // Print options
    configs.forEach((config, index) => {
      console.log(index + 1, config.title);
    });

    rl.question('Select: ', (inputString) => {
      rl.close();

      let input = parseInt(inputString, 10);
      let config = configs[input -1];
      if (config) {
        readline.moveCursor(rl.input, 0, -1 * configs.length - 1);
        readline.clearScreenDown(rl.input);
        console.log(chalk.green(config.title));
        resolve(config);
      }
      reject(`Config ${inputString} not found`);
    });
  });
}

async function getAction(actions) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    // Print actions
    actions.forEach((action, index) => {
      console.log(index + 1, action);
    });

    rl.question('Select: ', (inputString) => {
      rl.close();
      
      let input = parseInt(inputString, 10);
      let action = actions[input - 1];
      if (action) {
        readline.moveCursor(rl.input, 0, -3);
        readline.clearScreenDown(rl.input);
        console.log(chalk.green(action));
        resolve(input);
      }
      reject(`Config ${inputString} not found`);
    });
    
  });
}

module.exports = {
};
