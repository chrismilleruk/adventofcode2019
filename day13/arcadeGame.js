const { executeProgramAsGenerator } = require('../lib/intCodeComputer');

async function arcadeGame(programBuffer) {
  
  for await (const instr of arcadeInstructions(programBuffer)) {

  }
}

async function* arcadeInstructions(programBuffer) {
  let instr = [];
  for await (const output of executeProgramAsGenerator(programBuffer)) {
    instr.push(output);
    if (instr.length === 3) {
      yield instr;
      instr = [];
    }
  }
}

module.exports = { arcadeInstructions, arcadeGame };
