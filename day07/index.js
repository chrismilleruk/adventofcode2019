const { loadInputFile } = require('../day05/loadBuffer');
const { 
  runAmplifySequence, 
  findMaxAmplifySequence, 
  runAmplifySequenceWithFeedback,
  findMaxAmplifySequenceWithFeedback
} = require('./amplifier');
const readline = require('readline-sync');

const filename = __dirname + '/input.txt';

let configs = [
  {
    title: 'Part 1: Buffer from input file',
    buffer: filename,
    phaseSettingSequence: [ 3, 2, 0, 1, 4 ],
    maxThrusterSignal: 212460,
    useFeedback: false
  },
  {
    title: 'Part 2: Buffer from input file',
    buffer: filename,
    phaseSettingSequence: [ 8, 5, 9, 6, 7 ],
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
    phaseSettingSequence: [9,7,8,5,6],
    maxThrusterSignal: 18216,
    useFeedback: true
  }
]

if (require.main === module) {
  (async () => {
    try {
      const config = getConfig();
      const buffer = await (typeof config.buffer === "string" ? loadInputFile(config.buffer) : config.buffer);

      console.log(1, 'Run Amplifier Sequence');
      console.log(2, 'Find Max Amplifier Sequence');
      let input = readline.question('Select: ')

      if (input === "1") {
        let p = config.useFeedback ? 
          runAmplifySequenceWithFeedback(buffer, config.phaseSettingSequence) : 
          runAmplifySequence(buffer, config.phaseSettingSequence);
        const result = await p;
        console.log('Thruster Signal', result);
        console.log('Max', config.maxThrusterSignal, (result === config.maxThrusterSignal) ? '🏆' : '❌');
      } else if (input === "2") {
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


function getConfig() {
  configs.forEach((config, index) => {
    console.log(index, config.title);
  });
  let inputString = readline.question('Select: ');
  let input = parseInt(inputString, 10);
  if (configs[input]) {
    return configs[input];
  }
  throw `Config ${inputString} not found`;
}

module.exports = {
};
