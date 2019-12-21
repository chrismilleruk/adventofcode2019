const { loadIntcodeFile } = require('../lib/loadIntcode');
const { runRepairDroid, RepairDroid, Content } = require('./repairDroid');
const { preparePlotArea, plotPanelAsBlock } = require('../lib/render');
const readline = require('readline');
const chalk = require('chalk');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    console.log(chalk.yellowBright(`What is the fewest number of movement commands required to move the 
    repair droid from its starting position to the location of the oxygen system?`));

    try {
      const program = await loadIntcodeFile(filename);
      const droid = new RepairDroid();
      const startLocation = droid.location;

      const cursor = preparePlotArea(process.stdout, 25, 23);
      cursor.setOffset({ x: 13, y: 12 });
      cursor.moveTo(0, 0);

      const blocks = new Map();

      // Draw Start as Red.
      plotPanelAsBlock(cursor, startLocation, new Map(), { x: 0, y: 0 }, { color: chalk.redBright, value: Content.Empty });

      for await (const evt of runRepairDroid(program, droid, 3000)) {
        // Draw Walls as Blue.
        plotPanelAsBlock(cursor, evt.location, blocks, { x: 0, y: 0 }, { color: chalk.gray, value: Content.Wall });
      }

      // Draw Start as Red.
      plotPanelAsBlock(cursor, startLocation, new Map(), { x: 0, y: 0 }, { color: chalk.redBright, value: Content.Empty });

      // Draw Oxygen System as Blue.
      const overlay = new Map();
      plotPanelAsBlock(cursor, droid.oxygenSystem, overlay, { x: 0, y: 0 }, { color: chalk.blueBright, value: Content.OxygenSystem });

      cursor.close('Finished?', droid.done);

      console.log(chalk.yellow('Oxygen System: '), droid.oxygenSystem);
      console.log('Shortest distance to oxygen', droid.oxygenSystem.distance, (droid.oxygenSystem.distance === 294) ? '🏆' : '❌');
    } catch (ex) {
      console.error(ex);
    }

  })();
}
