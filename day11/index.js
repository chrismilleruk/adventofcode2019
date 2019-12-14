const { loadIntcodeFile } = require('../lib/loadIntcode');
const { paintingRobot, paintingRobotEventGenerator, initPanels } = require('./paintingRobot');
const { renderAllPanels, calculatePlotExtents, preparePlotArea, plotPanels } = require('./render');
const readline = require('readline');
const chalk = require('chalk');

const filename = __dirname + '/input.txt';

const configs = [
  {
    title: 'start color is black',
    initialColor: 0,
    paintedPanels: 2418
  },
  {
    title: 'start color is white',
    initialColor: 1,
    paintedPanels: 249
  },
]

if (require.main === module) {
  (async () => {
    console.log(chalk.yellowBright('How many panels does it paint at least once?'));

    try {
      const config = await getConfig();
      const program = await loadIntcodeFile(filename);

      await runPaintingRobotWithConfig(program.slice(), config);
      console.log('');

    } catch (ex) {
      console.error(ex);
    }

  })();
}

async function runPaintingRobotWithConfig(program, config) {
  console.log('Painting...');
  const panels = initPanels();
  const panel0 = panels.getPanel([0, 0]);
  panel0.color = config.initialColor;

  for await (const args of paintingRobotEventGenerator(panels, program)) {
    if (typeof onPaint === "function")
      onPaint.apply(panels, args);
  }

  renderAllPanels(process.stdout, panels);
  let paintedPanels = [...panels.values()].filter(panel => panel.coats > 0);

  console.log('Panels Painted', paintedPanels.length, (paintedPanels.length === config.paintedPanels) ? '🏆' : '❌');
}

function onPaint(panel, state) {
  readline.moveCursor(process.stdout, 0, -1);  // move cursor to beginning of line

  let colorFn = panel.color ? chalk.bgWhite.red : chalk.bgBlack.blue;
  console.log("Painting", colorFn(panel.color), ['^', '>', 'v', '<'][state.dir], state.coord, '              ');
}

async function getConfig() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve, reject) => {
    // Print options
    configs.forEach((config, index) => {
      console.log(index + 1, config.title);
    });

    rl.question('Select: ', (inputString) => {
      rl.close();

      let input = parseInt(inputString, 10);
      let config = configs[input -1];
      if (config) {
        readline.moveCursor(rl.input, 0, -1 * configs.length - 1);
        readline.clearScreenDown(rl.input);
        console.log(chalk.green(config.title));
        resolve(config);
      }
      reject(`Config ${inputString} not found`);
    });
  });
}
module.exports = {
};
