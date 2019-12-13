
const {
  executeProgram,
  executeProgramAsGenerator
} = require('../lib/intCodeComputer');


async function runAmplifySequenceWithFeedback(buffer, phaseSequence) {
  let sourceAmp = [4, 0, 1, 2, 3];
  let amplifiers = phaseSequence.map((phaseSetting, id) => {
    let outputs = [];

    async function getNextInput() {
      let sourceIdx = sourceAmp[id];
      let value = await amplifiers[sourceIdx].getOutput();
      // console.log('amp', id, 'got input from amp', sourceIdx, '-', value);
      return value;
    }

    function getOutput() {
      return new Promise((resolve) => {
        outputs.unshift(resolve);
        // console.log('amp', id, 'get output', '(Promise)', outputs);
      });
    }

    function setOutput(value) {
      // console.log('amp', id, 'setOutput', value, outputs);
      if (typeof outputs[0] === 'function') {
        outputs[0](value);
        outputs[0] = value;
      } else {
        // This happens on the last run where no other amp is waiting for input.
        outputs.unshift(value);
      }
    }

    let amp = {
      buffer: buffer.slice(),
      inputFn: inputGenerator(id, phaseSetting, getNextInput),
      getOutput,
      outputs,
      setOutput
    };

    amp.program = executeProgram(amp.buffer, amp.inputFn, setOutput);

    return amp;
  });

  // Amplifier input generator, will run forever
  // Delivers Phase Setting with 1st call.
  // subsequently returns signalStrength from previous amplifier
  async function* inputGenerator(id, phaseSetting, getNextInput) {
    // console.log('amp', id, 'phaseSetting', phaseSetting);
    yield phaseSetting;
    while (1) {
      let input = await getNextInput();
      yield input;
    }
  }

  setTimeout(() => {
    amplifiers[4].setOutput(0);
  });
  let output = await amplifiers[4].program;

  // for (let i in [0,1,2,3,4]) {
  //   console.log('amp', i, amplifiers[i].outputs);
  // }
  return output;
}

async function findMaxAmplifySequenceWithFeedback(buffer) {
  let max = 0;
  let sequence;
  for (const phaseSequence of phaseSequencePermutations([5, 6, 7, 8, 9])) {
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
  function outputFn(val) {
    signalStrength = val;
  }

  try {
    await executeProgram(buffer.slice(), inputGen, outputFn);
    await executeProgram(buffer.slice(), inputGen, outputFn);
    await executeProgram(buffer.slice(), inputGen, outputFn);
    await executeProgram(buffer.slice(), inputGen, outputFn);
    await executeProgram(buffer.slice(), inputGen, outputFn);
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
  for (const phaseSequence of phaseSequencePermutations([0, 1, 2, 3, 4])) {
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
