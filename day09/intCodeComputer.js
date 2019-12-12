
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
  let state = {
    ptr: 0,
    relBase: 0
  };
  let step;

  let outputBuffer = [];
  let lastOutput;

  while (step = await executeCommand(buffer, state, inputFn, (val) => outputBuffer.push(val))) {
    // Yield outputs
    while (outputBuffer.length > 0) {
      yield outputBuffer.shift();
    }

    // Once you're done processing an opcode, move to the next one by stepping forward 4 positions.
    // After an instruction finishes, the instruction pointer increases by the number of values in 
    // the instruction; until you add more instructions to the computer, this is always 4 
    // (1 opcode + 3 parameters) for the add and multiply instructions. (The halt instruction would
    // increase the instruction pointer by 1, but it halts the program instead.)
    state.ptr += step;
  }

  return lastOutput;
}

async function executeCommand(buffer, state, inputFn, outputFn) {
  if (typeof state !== "object") {
    let ptr = state || 0;
    state = {
      ptr,
      relBase: 0
    };
  }
  // let { ptr, relBase } = state;

  let [command, ...parameters] = buffer.slice(state.ptr);
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
    let parameterMode = parameterModes[position + 1];
    let parameterVal = parameters[position - 1]; // position 1 == index 0;

    switch (parameterMode) {
      case undefined:
      case '0':
        // Parameter mode 0, position mode, causes the parameter to be interpreted as a position
        // - if the parameter is 50, its value is the value stored at address 50 in memory. 
        if (typeof buffer[parameterVal] === 'undefined') {
          buffer[parameterVal] = 0;
        }
        return buffer[parameterVal];
      case '1':
        // Parameter mode 1, immediate mode, a parameter is interpreted as a value
        // - if the parameter is 50, its value is simply 50.
        return parameterVal;
      case '2': 
        // Parameter mode 2, relative mode, causes the parameter to be interpreted as a relative position
        // - if the parameter is 50, and the relative base is 20, the value stored at address 70 in memory. 
        if (typeof buffer[state.relBase + parameterVal] === 'undefined') {
          buffer[state.relBase + parameterVal] = 0;
        }
        return buffer[state.relBase + parameterVal];
      default:
        throw `unknown get parameter mode ${parameterMode} from command ${command} at ptr ${state.ptr}`;
    }
  }

  // Set a value accounting for parameter mode
  function setVal(position, value) {
    let parameterMode = parameterModes[position + 1];
    let parameterVal = parameters[position - 1]; // position 1 == index 0;

    switch (parameterMode) {
      case undefined:
      case '0':
        // Parameter mode 0, position mode, causes the parameter to be interpreted as a position
        return buffer[parameterVal] = value;
      case '2':
        // Parameter mode 2, relative mode, causes the parameter to be interpreted as a relative position
        // Like position mode, parameters in relative mode can be read from or written to.
        return buffer[state.relBase + parameterVal] = value;
      default:
        throw `unknown set parameter mode ${parameterMode} from command ${command} at ptr ${state.ptr}`;
    }
  }

  function jumpTo(target) {
    // "Normally, after an instruction is finished, the instruction pointer increases by 
    // the number of values in that instruction. However, if the instruction 
    // modifies the instruction pointer, that value is used and the instruction pointer 
    // is not automatically increased.""

    // We modify the instruction pointer by returning the delta between the pointer and the target.
    return target - state.ptr;
  }

  function incr(step) {
    // "Normally, after an instruction is finished, the instruction pointer increases by 
    // the number of values in that instruction. 
    return step;
  }

  // Add support for Input Generators by wrapping them in a simple async function.
  if (typeof inputFn !== "undefined" && typeof inputFn.next === 'function') {
    let oldInputFn = inputFn;
    inputFn = async () => {
      let result = await oldInputFn.next();
      return result.value;
    }
  }

  let result;
  switch (opcode) {
    case 1: // add
      result = getVal(1) + getVal(2);
      setVal(3, result);
      return incr(4);

    case 2: // multiply
      result = getVal(1) * getVal(2);
      setVal(3, result);
      return incr(4);

    case 3: // input
      result = await inputFn();
      setVal(1, result);
      return incr(2);

    case 4: // output
      await outputFn(getVal(1));
      return incr(2);

    case 5: // jump-if-true
      // Opcode 5 is jump-if-true: if the first parameter is non-zero, 
      // it sets the instruction pointer to the value from the second parameter. 
      // Otherwise, it does nothing.
      if (getVal(1) !== 0) {
        // if the instruction modifies the instruction pointer, that value is used and
        // the instruction pointer is not automatically increased.
        return jumpTo(getVal(2));
      }
      return incr(3);

    case 6: // jump-if-false
      // Opcode 6 is jump-if-false: if the first parameter is zero, 
      // it sets the instruction pointer to the value from the second parameter. 
      // Otherwise, it does nothing.
      if (getVal(1) === 0) {
        // if the instruction modifies the instruction pointer, that value is used and
        // the instruction pointer is not automatically increased.
        return jumpTo(getVal(2));
      }
      return incr(3);

    case 7: // less-than
      // Opcode 7 is less than: if the first parameter is less than the second parameter, 
      // it stores 1 in the position given by the third parameter. 
      // Otherwise, it stores 0.
      if (getVal(1) < getVal(2)) {
        setVal(3, 1);
      } else {
        setVal(3, 0);
      }
      return incr(4);

    case 8: // equals
      // Opcode 8 is equals: if the first parameter is equal to the second parameter, 
      // it stores 1 in the position given by the third parameter. 
      // Otherwise, it stores 0.
      if (getVal(1) == getVal(2)) {
        setVal(3, 1);
      } else {
        setVal(3, 0);
      }
      return incr(4);

    case 9: // adjust relative base 
      // Opcode 9 adjusts the relative base by the value of its only parameter. The relative base 
      // increases (or decreases, if the value is negative) by the value of the parameter.
      let relativeAdjustment = getVal(1);
      // console.log('relative adjustment', state.relBase, '+', relativeAdjustment);
      state.relBase += relativeAdjustment;
      return incr(2);

    case 99:
      return false;

    default:
      throw `unknown command ${command} at pos ${state.ptr}`;
  }
}

module.exports = {
  executeCommand,
  executeProgram,
  executeProgramAsGenerator
};
