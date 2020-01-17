const { loadIntcodeFile } = require('../lib/loadIntcode');
const { chunksToLines, charCodeToChar } = require('../lib/createStream');
const { executeProgramAsGenerator } = require('../lib/intCodeComputer');
const { getChoice } = require('../lib/interactive');


class AdventureGame {
  static async fromFile(filename) {
    const program = await loadIntcodeFile(filename);
    return new AdventureGame(program);
  }

  constructor(program) {
    this._program = program;
  }

  async interactiveMode(outputStream, readLine) {
    let inputs = [];

    const inputFn = async () => {
      if (inputs.length === 0) {
        const line = await readLine();
        const chars = line.split('').map(s=>s.charCodeAt(0));
        inputs = chars;
        inputs.push(10);
      }
      const input = inputs.shift();
      
      return input;
    }
    const outputs = [];
    
    const generator = executeProgramAsGenerator(this._program.slice(), inputFn);
    const charsAsync = charCodeToChar(generator);
    for await (let output of charsAsync) {
      outputs.push(output);
      outputStream.write(output);
    }

    return outputs[0];
  }
}


module.exports = { AdventureGame };