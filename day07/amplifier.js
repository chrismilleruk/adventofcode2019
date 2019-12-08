
const {
  executeProgram
} = require('./intCodeComputer');


async function runAmplifySequenceWithFeedback(buffer, phaseSequence) {
  let signalStrength = 0;

  let inputGen = inputGenerator(phaseSequence.slice());
  function inputFn() {
    return inputGen.next().value;
  }
  function outputFn(val) {
    signalStrength = val;
  }

  try {
    await executeProgram(buffer.slice(), inputFn, outputFn);
    await executeProgram(buffer.slice(), inputFn, outputFn);
    await executeProgram(buffer.slice(), inputFn, outputFn);
    await executeProgram(buffer.slice(), inputFn, outputFn);
    await executeProgram(buffer.slice(), inputFn, outputFn);
    return signalStrength;
  } catch (ex) {
    console.error(ex);
  }

  // This Phase Sequence Generator will run forever.
  // Alternating between the next phase setting, 
  // and the current signalStrength
  function* inputGenerator(phaseSequence) {
    while (1) {
      if (phaseSequence.length > 0) {
        const nextSequence = phaseSequence.shift();
        // phaseSequence.push(nextSequence);
        yield nextSequence;
      }
      yield signalStrength;
    }
  }
}

async function findMaxAmplifySequenceWithFeedback(buffer) {
  let max = 0;
  let sequence;
  for (const phaseSequence of phaseSequencePermutations([5,6,7,8,9])) {
    let result = await runAmplifySequenceWithFeedback(buffer, phaseSequence);
    if (result > max) {
      max = result;
      sequence = phaseSequence;
    }
  }
  return { max, sequence };
}

async function runAmplifySequence(buffer, phaseSequence) {
  let signalStrength = 0;
  let inputGen = gen(phaseSequence.slice());

  function inputFn() {
    // let input = readline.question("Diagnostic System ID: ");
    let input = inputGen.next().value;
    // console.log('input, ', input);
    return input;
  }
  function outputFn(val) {
    signalStrength = val;
    // console.log('signalStrength', val);
  }

  try {
    await executeProgram(buffer.slice(), inputFn, outputFn);
    await executeProgram(buffer.slice(), inputFn, outputFn);
    await executeProgram(buffer.slice(), inputFn, outputFn);
    await executeProgram(buffer.slice(), inputFn, outputFn);
    await executeProgram(buffer.slice(), inputFn, outputFn);
    return signalStrength;
  } catch (ex) {
    console.error(ex);
  }

  function* gen(phaseSequence) {
    // Start the copy of the amplifier controller software that will run on amplifier A. 
    // At its first input instruction, provide it the amplifier's phase setting, 3. 
    yield phaseSequence.shift();
    // At its second input instruction, provide it the input signal, 0. 
    yield signalStrength;
    // After some calculations, it will use an output instruction to indicate the amplifier's output signal.

    // Start the software for amplifier B. 
    // Provide it the phase setting (1) and then 
    // whatever output signal was produced from amplifier A. 
    yield phaseSequence.shift();
    yield signalStrength;
    // It will then produce a new output signal destined for amplifier C.

    // Start the software for amplifier C, provide the phase setting (2) 
    // and the value from amplifier B, then collect its output signal.
    yield phaseSequence.shift();
    yield signalStrength;

    // Run amplifier D's software, provide the phase setting (4) 
    // and input value, and collect its output signal.
    yield phaseSequence.shift();
    yield signalStrength;

    // Run amplifier E's software, provide the phase setting (0) 
    // and input value, and collect its output signal.
    yield phaseSequence.shift();
    yield signalStrength;
  }
}

async function findMaxAmplifySequence(buffer) {
  let max = 0;
  let sequence;
  for (const phaseSequence of phaseSequencePermutations([0,1,2,3,4])) {
    let result = await runAmplifySequence(buffer, phaseSequence);
    if (result > max) {
      max = result;
      sequence = phaseSequence;
    }
  }
  return { max, sequence };
}

// Efficient permution generator using Heap's method
// https://stackoverflow.com/a/37580979
function* phaseSequencePermutations(permutation) {
  var length = permutation.length,
    c = Array(length).fill(0),
    i = 1, k, p;

  yield permutation.slice();
  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      yield permutation.slice();
    } else {
      c[i] = 0;
      ++i;
    }
  }
}

module.exports = {
  runAmplifySequence,
  runAmplifySequenceWithFeedback,
  findMaxAmplifySequence,
  findMaxAmplifySequenceWithFeedback
}
