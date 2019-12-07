const { loadInputFile } = require('./loadBuffer');

// Memory to cache outputs from executeNounVerbProgram()
const NounVerbCache = new Map();

function executeNounVerbProgramWithCache(noun, verb, buffer) {
  // Return cached value if we've seen this combo before.
  let cacheKey = `${noun}_${verb}`;
  if (NounVerbCache.has(cacheKey)) {
    return NounVerbCache.get(cacheKey);
  }

  const result = executeNounVerbProgram(noun, verb, buffer);

  // Cache the output
  NounVerbCache.set(cacheKey, result)

  return result;
}

function executeNounVerbProgram(noun, verb, buffer) {
  // The inputs should still be provided to the program by replacing the values at 
  // addresses 1 and 2, just like before. In this program, the value placed in 
  // address 1 is called the noun, and the value placed in address 2 is called 
  // the verb. Each of the two input values will be between 0 and 99, inclusive.

  buffer[1] = noun;
  buffer[2] = verb;

  executeProgram(buffer);

  // What value is left at position 0 after the program halts?
  return buffer[0];;
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

module.exports = {
  executeCommand,
  executeProgram,
  executeNounVerbProgram: executeNounVerbProgramWithCache,
  loadInputFile
};
