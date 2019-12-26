
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
      return input;
    }
    const outputs = [];
    
    for await (let output of executeProgramAsGenerator(this._program.slice(), inputFn)) {
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

  async findSpaceFor(width, height, rowLimit = 1000) {
    let rightEdges = [];
    for (let y = 0; y < rowLimit; y += 1) {
      const rightEdgeMin = rightEdges[y - 1] || 0;
      const rightEdgeMax = rightEdgeMin + 10;
      
      let foundBeam = false;
      for (let x = rightEdgeMin; x < rightEdgeMax; x += 1) {
        let output = await this.testAt(x, y);
        if (foundBeam && output === 0) {
          rightEdges[y] = x - 1;
          // [rightEdges[y], y];/*?*/
          break;
        }
        if (output === 1) {
          foundBeam = true;
        }
      }

      const topRightX = rightEdges[y];
      const topRightY = y;
      const bottomLeftX = topRightX - width + 1;
      const bottomLeftY = topRightY + height - 1;

      // [bottomLeftX, topRightY, topRightX, bottomLeftY];/*?*/

      if (bottomLeftX > 0) {
        const bottomLeftTest = await this.testAt(bottomLeftX, bottomLeftY);
        if (bottomLeftTest === 1) {
          // [topRightX, topRightY, bottomLeftX, bottomLeftY];/*?*/

          return [bottomLeftX, topRightY];
        }
      }
    }
  }
}


module.exports = { DroneSystem }
