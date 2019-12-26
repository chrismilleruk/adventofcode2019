
const { loadIntcodeFile } = require('../lib/loadIntcode');
const { executeProgramAsGenerator } = require('../lib/intCodeComputer')
const { Panel } = require('../lib/render')

class DroneSystem {

  constructor(programFilename) {
    this._filename = programFilename
  }

  async loadTractorBeamTestProgram() {
    const program = await loadIntcodeFile(this._filename);
    this._program = program;
  }

  async testAt(x, y) {
    const inputs = [x, y];
    const inputFn = () => {
      const input = inputs.shift();
      input;/*?*/
      return input;
    }
    const outputs = [];
    
    for await (let output of executeProgramAsGenerator(this._program.slice(), inputFn)) {
      output;/*?*/
      outputs.push(output);
    }

    return outputs[0];
  }

  async* testGrid(width, height) {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        let output = await this.testAt(x, y);
        yield new Panel(x, y, output);
      }
    }
  }
}


module.exports = { DroneSystem }
