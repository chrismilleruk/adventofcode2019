
const {
  executeProgram,
  loadInputFile
} = require('../day05/intCodeComputer');


function runAmplifySequence(buffer, phaseSequence) {
  let signalStrength = 0;
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
    executeProgram(buffer.slice(), inputFn, outputFn);
    executeProgram(buffer.slice(), inputFn, outputFn);
    executeProgram(buffer.slice(), inputFn, outputFn);
    executeProgram(buffer.slice(), inputFn, outputFn);
    executeProgram(buffer.slice(), inputFn, outputFn);
    return signalStrength;
  } catch (ex) {
    console.error(ex);
  }
}

function findMaxAmplifySequence(buffer) {
  let max = 0;
  let sequence;
  for (const phaseSequence of phaseSequencePermutations()) {
    let result = runAmplifySequence(buffer, phaseSequence);
    if (result > max) {
      max = result;
      sequence = phaseSequence;
    }
  }
  return { max, sequence };
}

function* phaseSequencePermutations() {
  yield* permute([0, 1, 2, 3, 4]);
}

// Efficient permution generator using Heap's method
// https://stackoverflow.com/a/37580979
function* permute(permutation) {
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
  findMaxAmplifySequence
}