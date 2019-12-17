const { executeProgramAsGenerator } = require('../lib/intCodeComputer');

async function* playArcadeGame(programBuffer, inputFn) {
  // Memory address 0 represents the number of quarters that have been inserted; set it to 2 to play for free.
  programBuffer[0] = 2;
  
  for await (const instr of arcadeInstructions(programBuffer, inputFn)) {
    if (instr[0] === -1 && instr[1] === 0) {
      yield { event: 'score', score: instr[2] };
    } else {
      yield { event: 'tile', x: instr[0], y: instr[1], tileId: instr[2] };
    }
  }
}

async function* arcadeInstructions(programBuffer, inputFn) {
  let instr = [];
  for await (const output of executeProgramAsGenerator(programBuffer, inputFn)) {
    instr.push(output);
    if (instr.length === 3) {
      yield instr;
      instr = [];
    }
  }
}

module.exports = { arcadeInstructions, playArcadeGame };
