const { executeProgramAsGenerator } = require('../lib/intCodeComputer')
const { chunksToLines, charCodeToChar } = require('../lib/createStream')

class VacuumRobot {

  constructor(program) {
    this._program = program;
    this._view = false;
    this._inputBuffer = '';
    this._lastOutput = [];
    this._dustOutput = [];
  }

  get view() {
    if (!this._view) this.calculateView();
    return this._view;
  }

  get checksum() {
    return this.view.alignmentSum;
  }

  get dustCollected() {
    return this._dustOutput.slice(0, 10);
  }

  async calculateView() {
    const outputAsync = executeProgramAsGenerator(this._program.slice());
    const linesAsync = chunksToLines(charCodeToChar(outputAsync));
    this._view = await CameraView.fromLines(linesAsync);
  }

  async* spy(outputAsync) {
    for await (const output of outputAsync) {
      this._lastOutput.unshift(output);
      if (output > 0xFFF) {
        this._dustOutput.unshift(output);
      }
      yield output;
    }
  }

  async* runProgram() {
    let idx = 0;

    const inputFn = () => {
      let nextChar = this._inputBuffer[idx];
      if (nextChar === undefined) {
        throw `Ran out of input characters. ${idx}`
      }

      idx += 1;
      return nextChar.charCodeAt(0);
    }

    const outputAsync = this.spy(executeProgramAsGenerator(this._program.slice(), inputFn));
    const linesAsync = chunksToLines(charCodeToChar(outputAsync));

    let generator = this.view.continuousFeed(linesAsync);
    for await (const value of generator) {
      if (value.panels && value.robot) {
        this._view = value;
      }

      yield value; 
    }

    yield* outputAsync;
  }

  get panels() {
    return this._view._panels;
  }

  appendInputBuffer(chars) {
    this._inputBuffer += chars + '\n';
  }

  replaceInputBuffer(chars) {
    this._inputBuffer = chars;
  }

  wakeUp() {
    // Force the vacuum robot to wake up by 
    // changing the value in your ASCII program at address 0 from 1 to 2.
    this._program[0] = 2;
  }
}

class CameraView {
  constructor(intersections, corners, panels, robot, alignmentSum) {
    this._intersections = intersections;
    this._corners = corners;
    this._panels = panels
    this._robot = robot;
    this._alignmentSum = alignmentSum;
  }

  static async fromLines(linesAsync) {
    const { intersections, corners, panels, robot, alignmentSum } = await analyzeCameraOutput(linesAsync);
    return new CameraView(intersections, corners, panels, robot, alignmentSum);
  }

  async* continuousFeed(linesAsync, numRows = 53) {
    let x = 0, y = 0;
    let panels = new Map();
    let robot = this.robot;

    for await (const line of linesAsync) {
      if (line.length < 55) {
        // process.stderr.write(String(line.length))
        yield line;
        continue;
      }
      
      x = 0;
      for (const char of line) {
  
        const charPosition = '#^v<>'.indexOf(char);
        if (charPosition > -1) {
          let panel = { 
            coord: [x, y],
            color: 1
          };
          panels.set(String([x, y]), panel)
  
          if (charPosition > 0) {
            // It's the robot!
            robot.pos = [x, y];
            robot.dir = 'NSWE'[charPosition - 1];
            robot.icon = '^v<>'[charPosition - 1];
          }
        }
  
        x += 1;
      }

      y += 1;

      // In continuous mode, we just get more lines.  
      if (y >= numRows) {
        this._panels = panels;
        this._robot = robot;
        yield this;
        panels = new Map();
        // console.log(panels.size);
        // newPanels.length = 0;
        y = 0;  
      }
    }
  }

  get corners() {
    return this._corners;
  }

  get intersections() {
    return this._intersections;
  }

  get alignmentSum() {
    return this._alignmentSum;
  }

  get panels() {
    return this._panels;
  }

  get robot() {
    return this._robot;
  }

  getInstructions() {
    if (!this._corners) throw 'No corners found'
    if (!this._robot) throw 'No robot found'

    const instructions = [];

    const rightTurn = 'NESWN';
    const leftTurn = 'NWSEN';

    let robot = this._robot;
    let corner = this._corners.get(String(robot.pos));

    // corner;
    // { pos: [ 10, 6 ],
    //   dirs: Set { 'N' },
    //   N: 
    //    { pos: [ 12, 2 ],
    //      dirs: Set { 'W', 'S' },
    //      W: { pos: [Object], dirs: [Object], E: [Circular], S: [Object] },
    //      S: [Circular] } }
    
    // this._robot;
    // { pos: [ 10, 6 ], dir: 'N' }

    while (instructions.length === 0 || corner.dirs.size > 1) {
      // Direction
      if (!corner.dirs.has(robot.dir)) {
        // Turn the robot Left or Right
        let rt = rightTurn[rightTurn.indexOf(robot.dir) + 1];
        let lt = leftTurn[leftTurn.indexOf(robot.dir) + 1];

        if (corner.dirs.has(rt)) {
          // Right turn;
          instructions.push('R');
          robot.dir = rt;
        } else if (corner.dirs.has(lt)) {
          // Left turn;
          instructions.push('L');
          robot.dir = lt;
        } else {
          // If Left or Right not possible, stop.
          break;
        }
      }

      // Three rights make a left
      if (instructions.slice(-3).join('') == 'RRR') {
        instructions.splice(-3, 3, 'L')
      }

      if (instructions.slice(-2).join('') == 'RR') {
        // We had to turn around so break;
        break;
      }

      // Distance
      const corner2 = corner[robot.dir];
      const axis = ['E', 'W'].indexOf(robot.dir) > -1 ? 0 : 1;
      const distance = Math.abs(corner2.pos[axis] - corner.pos[axis]);
      instructions.push(distance);

      corner = corner2;
    }

    return instructions;
  }

  static splitInstructions(instructions) {
    // R, 8, R, 8, R, 4, R, 4, R, 8, L, 6, L, 2, R, 4, R, 4, R, 8, R, 8, R, 8, L, 6, L, 2
    let str = instructions.join(',');
    const regex1 = new RegExp(`([LR],?)+`)
    const splits = [];
    while (str.match(regex1)) {
      let { substr } = findNextSubset(str)
      // substr;/*?*/
      splits.push(substr);
      str = str.split(substr).join(String.fromCharCode(64 + splits.length))
    }

    splits.unshift(str);
    return splits;

    function findNextSubset(str) {
      // const splitNames = 'ABCDEFGHIJK';
      const regex1 = new RegExp(`^([ABCDEFGHIJK],?)+`)
      const regex2 = new RegExp(`,([ABCDEFGHIJK],?)+`)
      str = str.replace(regex1, '');

      let scores = [];

      for (let match of str.matchAll(/,/g)) {
        let substr = str.substr(0, match.index);

        // Check even number of pieces.
        const parts = substr.split(',');
        if (parts.length % 2 === 1) {
          continue;
        }

        // Check substr doesn't contain A-K
        if (substr.match(regex2)) {
          break;
        }

        // Check substr less than 20 chars.
        if (substr.length > 20) {
          break;
        }

        // We want to encourage 
        // 1) 'R,6,R,8,R,8' 11chars, 6parts, x4 times - is better than.
        // 2) 'R,6,R,8,R,8,R,6,R,6' 19 chars, 10 parts, x3 times
        // 3) 'R,6' 3chars, 2 parts, x12 times - this is the worst.

        // If a string is 10-20 chars then give it a boost.
        let lengthMultiplier = substr.length > 10 ? 3 : 1;
        let matches = [...str.matchAll(substr)];
        const score = (parts.length * lengthMultiplier) * (matches.length * matches.length);

        scores.push({
          substr,
          positions: matches.map(m => m.index),
          score
        });
      }

      scores;/*?*/
      if (scores.length < 1) {
        str = str.replace(regex2, 'XX').split('XX')[0];
        // throw `No scores from '${str}'`
        return {
          substr: str
        }
      }
      const best = scores.reduce((best, next) => {
        return (next.score >= best.score) ? next : best;
      })

      return best;
    }
  }
}

async function analyzeCameraOutput(linesAsync) {
  let intersections = new Set();
  let corners = new Map();
  let panels = new Map();
  let robot = {
    pos: [],
    dir: -1
  }
  let alignmentSum = 0;
  let scaffoldLocations = [];
  let x = 0, y = 0;

  for await (const output of linesAsync) {
    // if (output === '') break;
    x = 0;

    let scaffoldOnThisLine = new Set();
    scaffoldLocations.push(scaffoldOnThisLine)

    // In the camera output, # represents a scaffold and . represents open space. 
    // The vacuum robot is visible as ^, v, <, or > depending on whether it is
    //  facing up, down, left, or right respectively. When drawn like this, the 
    // vacuum robot is always on a scaffold; if the vacuum robot ever walks off 
    // of a scaffold and begins tumbling through space uncontrollably, it will 
    // instead be visible as X.
    let last3 = 0;
    for (const char of output) {
      last3 *= 2;

      const charPosition = '#^v<>'.indexOf(char);
      if (charPosition > -1) {
        panels.set(String([x, y]), { 
          coord: [x, y],
          color: 1
        })
        scaffoldOnThisLine.add(x);
        last3 += 1;

        if (charPosition > 0) {
          // It's the robot!
          robot.pos = [x, y];
          robot.dir = 'NSWE'[charPosition - 1];
          robot.icon = '^v<>'[charPosition - 1];
        }
      }

      // Find horizontal ends.
      last3 = checkHorizontal(last3, x - 1, y);

      // Find vertical ends.
      if (y > 0) {
        const testY = y - 1;
        checkVertical(x, testY);
      }

      x += 1;
    }

    // Find horizontal ends at line end.
    last3 *= 2;
    last3 = checkHorizontal(last3, x - 1, y);

    if (y >= 2) {
      const testY = y - 1;
      // A number is an intersection/junction if:
      //      It exists on three lines in a row. (Intersection)
      let common = intersection(
        [...scaffoldLocations[testY + 1]], 
        [...scaffoldLocations[testY]], 
        [...scaffoldLocations[testY - 1]]);
      //  And It has n-1 and n+1 on the middle line.
      for (let testX of common) {
        if (scaffoldLocations[testY].has(testX - 1)
          && scaffoldLocations[testY].has(testX + 1)) {
          // intersection found!!!
          intersections.add([testX, testY]);
          // its alignment parameter is the distance from the left edge of the view multiplied by 
          // the distance from the top edge of the view. 
          alignmentSum += (testX * (testY));
        }
      }
    }

    y += 1;
  }

  // Find vertical ends on bottom row.
  for (const x of scaffoldLocations[y - 1]) {
    checkVertical(x, y - 1)
  }

  return { intersections: [...intersections], corners, panels, robot, alignmentSum };

  function addCorner(x, y, dir) {
    const key = String([x, y]);
    let corner1 = corners.get(key);
    if (!corners.has(key)) {
      corner1 = {
        pos: [x, y],
        dirs: new Set()
      }
    }
    corner1.dirs.add(dir);
    corners.set(key, corner1);

    if (dir === 'W') {
      // Then look for a complementary corner with:
      //  y = corner1.y
      //  dir = 'E'
      for (let [key, corner2] of corners) {
        if (corner1.pos[1] === corner2.pos[1]
          && corner2.dirs.has('E') &&
          typeof corner2['E'] === 'undefined') {
            corner2['E'] = corner1;
            corner1['W'] = corner2;
            break;
        }
      }
    }

    if (dir === 'N') {
      // Then look for a complementary corner with:
      //  x = corner1.x
      //  dir = 'S'
      for (let [key, corner2] of corners) {
        if (corner1.pos[0] === corner2.pos[0]
          && corner2.dirs.has('S') &&
          typeof corner2['S'] === 'undefined') {
            corner2['S'] = corner1;
            corner1['N'] = corner2;
            break;
        }
      }
    }
  }

  function checkVertical(x, y) {
    if (scaffoldLocations[y].has(x)) {
      const before = scaffoldLocations[y - 1] || new Set();
      const after = scaffoldLocations[y + 1] || new Set();
      if (before.has(x) !== after.has(x)) {
        addCorner(x, y, before.has(x) ? 'N' : 'S');
      }
    }
  }

  function checkHorizontal(checksum, x, y) {
    checksum &= 0b111;
    if ([0b11, 0b110].indexOf(checksum) > -1) {
      addCorner(x, y, checksum === 0b11 ? 'E' : 'W');
    }
    return checksum;
  }
}

// Stolen from: https://stackoverflow.com/a/37320681
function intersection() {
  var result = [];
  var lists;

  if (arguments.length === 1) {
    lists = arguments[0];
  } else {
    lists = arguments;
  }

  for (var i = 0; i < lists.length; i++) {
    var currentList = lists[i];
    for (var y = 0; y < currentList.length; y++) {
      var currentValue = currentList[y];
      if (result.indexOf(currentValue) === -1) {
        var existsInAll = true;
        for (var x = 0; x < lists.length; x++) {
          if (lists[x].indexOf(currentValue) === -1) {
            existsInAll = false;
            break;
          }
        }
        if (existsInAll) {
          result.push(currentValue);
        }
      }
    }
  }
  return result;
}

module.exports = { VacuumRobot, CameraView };
