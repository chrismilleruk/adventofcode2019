const fs = require('fs');
const readline = require('readline');

const filename = __dirname+'/input.txt';

if (require.main === module) {
  process1202Program(filename).then(result => console.log('1202 program result', result));
}

async function* valuesToIntegers(valuesAsync) {
  for await (const value of valuesAsync) {
    yield parseInt(value, 10);
  }
}

async function* chunksToValues(chunksAsync) {
  let previous = '';
  for await (const chunk of chunksAsync) {
    previous += chunk;
    let eolIndex;
    while ((eolIndex = previous.indexOf(',')) >= 0) {
      // value excludes the comma
      const value = previous.slice(0, eolIndex);
      yield value;
      previous = previous.slice(eolIndex+1);
    }
  }
  if (previous.length > 0) {
    yield previous;
  }
}

async function loadInputFile(filename) {
  // This line opens the file as a readable stream
  var readStream = fs.createReadStream(filename,
    { encoding: 'utf8', highWaterMark: 1024 });

  let result = [];
  for await (const integer of valuesToIntegers(chunksToValues(readStream)) ) {
    result.push(integer)
  }
  // let valuesAsync = await chunksToValues(readStream);
  // let integersAsync = await valuesToIntegers(valuesAsync);
  // let result = await integersAsync;/*?*/
  return result;
}

async function process1202Program(filename) {
  buffer = await loadInputFile(filename);

  // Once you have a working computer, the first step is to restore the
  // gravity assist program (your puzzle input) to the "1202 program alarm"
  // state it had just before the last computer caught fire.

  // To do this, before running the program,
  // replace position 1 with the value 12 and
  // replace position 2 with the value 2.
  buffer[1] = 12;
  buffer[2] = 2;

  executeProgram(buffer);

  // What value is left at position 0 after the program halts?
  return buffer[0];
}

function executeProgram(buffer) {
  // The address of the current instruction is called the instruction pointer; it starts at 0. 
  let pointer = 0;
  let step;

  while (step = executeCommand(buffer, pointer)) {
    // Once you're done processing an opcode, move to the next one by stepping forward 4 positions.
    // After an instruction finishes, the instruction pointer increases by the number of values in 
    // the instruction; until you add more instructions to the computer, this is always 4 
    // (1 opcode + 3 parameters) for the add and multiply instructions. (The halt instruction would
    // increase the instruction pointer by 1, but it halts the program instead.)
    pointer += step;
  }
}

function executeCommand(buffer, pos) {
  let [command, val1, val2, result] = buffer.slice(pos);
  switch (command) {
    case 1: // add
      buffer[result] = buffer[val1] + buffer[val2];
      return 4;
    case 2: // multiply
      buffer[result] = buffer[val1] * buffer[val2];
      return 4;
    case 99:
      return false;
    default:
      throw `unknown command ${command} at pos ${pos}`;
  }
}

module.exports = { executeCommand, executeProgram, loadInputFile, process1202Program };
