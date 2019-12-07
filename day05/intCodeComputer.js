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

function executeProgram(buffer, inputFn, outputFn) {
  // The address of the current instruction is called the instruction pointer; it starts at 0. 
  let pointer = 0;
  let step;

  while (step = executeCommand(buffer, pointer, inputFn, outputFn)) {
    // Once you're done processing an opcode, move to the next one by stepping forward 4 positions.
    // After an instruction finishes, the instruction pointer increases by the number of values in 
    // the instruction; until you add more instructions to the computer, this is always 4 
    // (1 opcode + 3 parameters) for the add and multiply instructions. (The halt instruction would
    // increase the instruction pointer by 1, but it halts the program instead.)
    pointer += step;
  }
}

function executeCommand(buffer, pos, inputFn, outputFn) {
  let [command, ...parameters] = buffer.slice(pos);
  // Opcode is last two digits of command
  let opcode = command % 100;
  // Parameters that an instruction writes to will never be in immediate mode so we need direct access
  let [p1, p2, p3, p4] = parameters;
  let parameterModes = [...new String(command)].reverse();

  // Read parameters accounting for parameter mode.
  function getVal(position) {
    // Example:   ABCDE
    //             1002
    //   DE - two-digit opcode,      02 == opcode 2
    //   C - mode of 1st parameter,  0 == position mode
    //   B - mode of 2nd parameter,  1 == immediate mode
    //   A - mode of 3rd parameter,  0 == position mode,
    //                                     omitted due to being a leading zero
    let parameterMode = parameterModes[position + 1] === '1' ? 1 : 0;
    let parameterVal = parameters[position - 1]; // position 1 == index 0;

    if (parameterMode === 0) {
      // Parameter mode 0, position mode, causes the parameter to be interpreted as a position
      // - if the parameter is 50, its value is the value stored at address 50 in memory. 
      return buffer[parameterVal];
    } else {
      // Parameter mode 1, immediate mode, a parameter is interpreted as a value
      // - if the parameter is 50, its value is simply 50.
      return parameterVal;
    }
  }

  switch (opcode) {
    case 1: // add
      buffer[p3] = getVal(1) + getVal(2);
      return 4;
    case 2: // multiply
      buffer[p3] = getVal(1) * getVal(2);
      return 4;
    case 3: // input
      buffer[p1] = inputFn();
      return 2;
    case 4: // output
      outputFn(getVal(1));
      return 2;
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
