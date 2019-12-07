const fs = require('fs');
const readline = require('readline');
const {
  loadInputFile,
  executeNounVerbProgram
} = require('./intCodeComputer');


const filename = __dirname + '/input.txt';

if (require.main === module) {
  process1202Program(filename).then(result => console.log('1202 program result', result));
  findNounVerbInputs(filename, 19690720).then(result => {
    console.log('complete the gravity assist', result);
  });
}

async function process1202Program(filename) {
  buffer = await loadInputFile(filename);

  // Once you have a working computer, the first step is to restore the
  // gravity assist program (your puzzle input) to the "1202 program alarm"
  // state it had just before the last computer caught fire.

  // To do this, before running the program,
  // replace position 1 with the value 12 and
  // replace position 2 with the value 2.
  executeNounVerbProgram(12, 2, buffer);

  // What value is left at position 0 after the program halts?
  return buffer[0];
}

async function findNounVerbInputs(filename, expectedOutput) {
  // "With terminology out of the way, we're ready to proceed. To complete the gravity assist, 
  // you need to determine what pair of inputs produces the output 19690720."

  input = await loadInputFile(filename);

  //Each of the two input values will be between 0 and 99, inclusive.
  for (let noun = 0; noun < 100; noun++) {
    for (let verb = 0; verb < 100; verb++) {
      // Copy input to temporary buffer.
      buffer = [...input];

      let output = executeNounVerbProgram(noun, verb, buffer);

      if (output === expectedOutput) {
        return { noun, verb };
      }
    }
  }

  throw 'not found';
}

module.exports = {
  findNounVerbInputs,
  process1202Program
};
