
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

  async* findEdges(height) {
    let leftEdges = [];
    let rightEdges = [];
    for (let y = 0; y < height; y += 1) {
      const leftEdgeMin = leftEdges[y - 1] || 0;
      const rightEdgeMin = rightEdges[y - 1] || 0;
      const rightEdgeMax = rightEdgeMin + 10;
      
      let foundBeam = false;
      for (let x = leftEdgeMin; x < rightEdgeMax; x += 1) {
        let output = await this.testAt(x, y);
        if (!foundBeam && output === 1) {
          leftEdges[y] = x;
          foundBeam = true;
          x = Math.max(x, rightEdgeMin);
        }
        if (foundBeam && output === 0) {
          rightEdges[y] = x - 1;
          // [rightEdges[y], y];/*?*/
          break;
        }
      }

      yield { y, left: leftEdges[y], right: rightEdges[y] };
    }
  }

  async* testGrid(width, height) {
    for await (const edge of this.findEdges(height)) {
      let right = Math.min(edge.right, width - 1);
      for (let x = edge.left; x <= right; x += 1) {
        yield new Panel(x, edge.y, 1);
      }
    }
  }

  async findSpaceFor(width, height, rowLimit = 1000) {
    for await (const edge of this.findEdges(rowLimit)) {
      const topRightX = edge.right;
      const topRightY = edge.y;
      const bottomLeftX = topRightX - width + 1;
      const bottomLeftY = topRightY + height - 1;

      if (bottomLeftX > 0) {
        const bottomLeftTest = await this.testAt(bottomLeftX, bottomLeftY);
        if (bottomLeftTest === 1) {
          return [bottomLeftX, topRightY];
        }
      }
    }
  }
}


module.exports = { DroneSystem }
