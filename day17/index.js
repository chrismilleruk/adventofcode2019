const { loadIntcodeFile } = require('../lib/loadIntcode');
const { VacuumRobot, CameraView } = require('./vacuumRobot');
const { preparePlotArea, plotPanelAsBlock } = require('../lib/render');

const readlineSync = require('readline-sync')
const chalk = require('chalk');

const filename = __dirname + '/input.txt';
let frame = 0;

if (require.main === module) {
  (async () => {

    try {
      let cursor;
      const program = await loadIntcodeFile(filename);
      const robot = new VacuumRobot(program);
      let t0 = Date.now();

      // Part 1
      console.log(chalk.yellowBright(`What is the sum of the alignment parameters for the scaffold intersections?`));
      await robot.calculateView();
      let alignmentSum = await robot.checksum;
      console.log('Sum of the alignment parameters', alignmentSum, (alignmentSum === 10064) ? '🏆' : '❌');
      console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));

      // Render area
      renderSingleView(robot.view);

      // Part 2
      console.log(chalk.yellowBright(`After visiting every part of the scaffold at least once, how much dust does the vacuum robot report it has collected?`));
      const instructions = robot.view.getInstructions();
      const splits = CameraView.splitInstructions(instructions);
      console.log(instructions, splits);

      robot.wakeUp();
      const robotProgram = robot.runProgram();

      // First we have a series of Q&As
      const answers = {
        'Main:': splits[0],
        'Function A:': splits[1],
        'Function B:': splits[2],
        'Function C:': splits[3],
      };

      // Use an iterator because for ... await will terminate the generator prematurely.
      let moreQuestions = true;
      let iterator = {};
      while (moreQuestions && !iterator.done) {
        iterator = await robotProgram.next();
        const question = iterator.value;
        const answer = answers[question];

        if (answer) {
          console.log(chalk.yellow(question), answer);
          robot.appendInputBuffer(answer)
        } else if (question === 'Continuous video feed?') {
          const input = readlineSync.keyInYN(question);
          robot.appendInputBuffer(input ? 'y\n' : 'n\n')
          break;
        } else {
          renderSingleView(question);
        }
      }

      // Create Render area
      cursor = preparePlotArea(process.stdout, 55 / 2, 60 / 2);
      cursor.setOffset({ x: 0, y: 0 });
      cursor.moveTo(0, 0);
      
      for await (const output of robotProgram) {
        // cursor.write(frame);
        let panelMap = new Map();
        if (output.panels && output.robot) {
          // executes once per view rendered.
          renderView(cursor, output, panelMap);
        } else {
          // Treat as an output.
          cursor.moveTo(20, 0);
          cursor.write(output, chalk.red);
          // cursor.close('dust collected', view)
        }
      }

      cursor.close('Dust', robot.dustCollected)

      console.log('Dust collected', robot.dustCollected[0], (robot.dustCollected[0] === 1197725) ? '🏆' : '❌');
      console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));

    } catch (ex) {
      console.error(ex);
    }

  })();
}

function renderSingleView(view) {
  let cursor = preparePlotArea(process.stdout, 55 / 2, 55 / 2);
  cursor.setOffset({ x: 0, y: 0 });
  cursor.moveTo(0, 0);

  const panelMap = new Map();

  renderView(cursor, view, panelMap);

  cursor.close('Alignment Sum', view.alignmentSum)
}

function renderView(cursor, view, panelMap) {
  frame += 1;

  cursor.clear();

  for (const panel of view.panels.values()) {
    // Draw Walls.
    let color = { color: frame % 2 ? chalk.white : chalk.blue, value: 1 };
    plotPanelAsBlock(cursor, panel, panelMap, { x: 0, y: 0 }, color);
  }

  // Draw Robot as Red.
  const robot = view.robot;
  cursor.moveTo(robot.pos[0] / 2, robot.pos[1] / 2)
  cursor.write(robot.icon, chalk.red)
  cursor.moveTo(0, 0)
}

