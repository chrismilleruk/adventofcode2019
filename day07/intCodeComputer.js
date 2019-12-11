
async function executeProgram(buffer, inputFn, outputFn) {
  let lastOutput;
  let asyncIterator = executeProgramAsGenerator(buffer, inputFn);
  for await (const output of asyncIterator) {
    lastOutput = output;
    outputFn(output);
  }
  return lastOutput;
}

async function* executeProgramAsGenerator(buffer, inputFn) {
  // The address of the current instruction is called the instruction pointer; it starts at 0. 
  let pointer = 0;
  let step;

  let outputBuffer = [];
  let lastOutput;

  while (step = await executeCommand(buffer, pointer, inputFn, (val) => outputBuffer.push(val))) {
    // Yield outputs
    while (outputBuffer.length > 0) {
      yield outputBuffer.shift();
    }

    // Once you're done processing an opcode, move to the next one by stepping forward 4 positions.
    // After an instruction finishes, the instruction pointer increases by the number of values in 
    // the instruction; until you add more instructions to the computer, this is always 4 
    // (1 opcode + 3 parameters) for the add and multiply instructions. (The halt instruction would
    // increase the instruction pointer by 1, but it halts the program instead.)
    pointer += step;
  }

  return lastOutput;
}

async function executeCommand(buffer, ptr, inputFn, outputFn) {
  let [command, ...parameters] = buffer.slice(ptr);
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

  function jumpTo(target) {
    // "Normally, after an instruction is finished, the instruction pointer increases by 
    // the number of values in that instruction. However, if the instruction 
    // modifies the instruction pointer, that value is used and the instruction pointer 
    // is not automatically increased.""

    // We modify the instruction pointer by returning the delta between the pointer and the target.
    return target - ptr;
  }

  // Add support for Input Generators by wrapping them in a simple async function.
  if (typeof inputFn !== "undefined" && typeof inputFn.next === 'function') {
    let oldInputFn = inputFn;
    inputFn = async () => {
      let result = await oldInputFn.next();
      return result.value;
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
      buffer[p1] = await inputFn();
      return 2;

    case 4: // output
      await outputFn(getVal(1));
      return 2;

    case 5: // jump-if-true
      // Opcode 5 is jump-if-true: if the first parameter is non-zero, 
      // it sets the instruction pointer to the value from the second parameter. 
      // Otherwise, it does nothing.
      if (getVal(1) !== 0) {
        // if the instruction modifies the instruction pointer, that value is used and
        // the instruction pointer is not automatically increased.
        return jumpTo(getVal(2));
      }
      return 3;

    case 6: // jump-if-false
      // Opcode 6 is jump-if-false: if the first parameter is zero, 
      // it sets the instruction pointer to the value from the second parameter. 
      // Otherwise, it does nothing.
      if (getVal(1) === 0) {
        // if the instruction modifies the instruction pointer, that value is used and
        // the instruction pointer is not automatically increased.
        return jumpTo(getVal(2));
      }
      return 3;

    case 7: // less-than
      // Opcode 7 is less than: if the first parameter is less than the second parameter, 
      // it stores 1 in the position given by the third parameter. 
      // Otherwise, it stores 0.
      if (getVal(1) < getVal(2)) {
        buffer[p3] = 1;
      } else {
        buffer[p3] = 0;
      }
      return 4;

    case 8: // equals
      // Opcode 8 is equals: if the first parameter is equal to the second parameter, 
      // it stores 1 in the position given by the third parameter. 
      // Otherwise, it stores 0.
      if (getVal(1) == getVal(2)) {
        buffer[p3] = 1;
      } else {
        buffer[p3] = 0;
      }
      return 4;

    case 99:
      return false;

    default:
      throw `unknown command ${command} at pos ${ptr}`;
  }
}

module.exports = {
  executeCommand,
  executeProgram,
  executeProgramAsGenerator
};
