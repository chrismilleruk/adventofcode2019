const fs = require('fs');
const readline = require('readline');

const filename = __dirname+'/input.txt';

if (require.main === module) {
  processInputFile(filename).then(result => console.log(result));
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
      value;
      yield value;
      previous = previous.slice(eolIndex+1);
    }
  }
  if (previous.length > 0) {
    yield previous;/*?*/
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

async function processInputFile(filename) {
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
  let pos = 0;
  while (executeCommand(buffer, pos)) {
    // Once you're done processing an opcode, move to the next one by stepping forward 4 positions.
    pos += 4;
  }
}

function executeCommand(buffer, pos) {
  let [command, val1, val2, result] = buffer.slice(pos);
  switch (command) {
    case 1:
      buffer[result] = buffer[val1] + buffer[val2];
      return true;
    case 2:
      buffer[result] = buffer[val1] * buffer[val2];
      return true;
    case 99:
      return false;
    default:
      throw `unknown command ${command} at pos ${pos}`;
  }
}

module.exports = { executeCommand, executeProgram, loadInputFile, processInputFile };
