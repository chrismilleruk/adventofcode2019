const { loadIntcodeFile } = require('../lib/loadIntcode');
const { paintingRobot } = require('./paintingRobot');
const { renderPanels } = require('./render');
const readline = require('readline');
const chalk = require('chalk');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    console.log(chalk.yellowBright('How many panels does it paint at least once?'));
    
    try {
      const program = await loadIntcodeFile(filename);

      console.log('Painting...');
      let i = 0;
      const panels = await paintingRobot(program, onPaint);
  
      let paintedPanels = [...panels.values()].filter(panel => panel.coats > 0);
  
      console.log('Panels Painted', paintedPanels.length, (paintedPanels.length === 2418) ? '🏆' : '❌');

      renderPanels(process.stdout, panels);
    } catch (ex) {
      console.error(ex);
    }

  })();
}

function onPaint(panel, state) {
  readline.moveCursor(process.stdout, 0, -1);  // move cursor to beginning of line

  let colorFn = panel.color ? chalk.bgWhite.red : chalk.bgBlack.blue;
  console.log("Painting", colorFn(panel.color), ['^', '>', 'v', '<'][state.dir], state.coord, '              ');
}

module.exports = {
};
