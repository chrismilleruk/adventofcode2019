const { executeProgramAsGenerator } = require('../lib/intCodeComputer')
const { chunksToLines, charCodeToChar } = require('../lib/createStream')

// async function* runVacuumRobot(program, robot, maxMoves = -1) {

//   // TODO: Replace with correct program.
//   // let lastMove = 0;
//   // const inputFn = () => {
//   //   lastMove = robot.next();
//   //   if (lastMove.done) {
//   //     return -1;
//   //     // throw `No more inputs from robot.`
//   //   }
//   //   return lastMove.value;
//   // };
//   const outputAsync = executeProgramAsGenerator(program, inputFn);
//   for await (const output of outputAsync) {
//     yield robot.move(lastMove.value, output);
//     //   maxMoves -= 1;
//     //   if (maxMoves === 0) break;
//   }
// }

class VacuumRobot {

  constructor(program) {
    this._program = program;
  }

  async getCheckSum() {
    const outputAsync = executeProgramAsGenerator(this._program);
    const linesAsync = chunksToLines(charCodeToChar(outputAsync));
    let { alignmentSum } = await getIntersectionsInCameraOutput(linesAsync);
    return alignmentSum;
  }
}

async function getIntersectionsInCameraOutput(linesAsync) {
  let intersections = [];
  let alignmentSum = 0;
  let scaffoldLocations = [];
  let x = 0, y = 0;
  for await (const output of linesAsync) {
    x = 0;
    let scaffoldOnThisLine = [];
    scaffoldLocations.push(scaffoldOnThisLine)

    for (const char of output) {
      if (char === '#') {
        scaffoldOnThisLine.push(x);
      }

      x += 1;
    }

    if (y >= 2) {
      // A number is an intersection/junction if:
      //      It exists on three lines in a row. (Intersection)
      let common = intersection(scaffoldLocations[y], scaffoldLocations[y - 1], scaffoldLocations[y - 2]);
      //  And It has n-1 and n+1 on the middle line.
      for (let n of common) {
        if (scaffoldLocations[y - 1].indexOf(n - 1) > -1
          && scaffoldLocations[y - 1].indexOf(n + 1) > -1) {
          // intersection found!!!
          intersections.push([n, y - 1]);
          // its alignment parameter is the distance from the left edge of the view multiplied by 
          // the distance from the top edge of the view. 
          alignmentSum += (n * (y -1));
        }
      }
    }

    y += 1;
  }

  return { intersections, alignmentSum };
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

module.exports = { VacuumRobot, getIntersectionsInCameraOutput };
