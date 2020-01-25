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
      plotPanelAsBlock(cursor, startLocation, new Map(), { color: { colorFn: chalk.redBright, when: Content.Empty } });

      for await (const evt of runRepairDroid(program, droid, 5000)) {
        // Draw Walls as Blue.
        plotPanelAsBlock(cursor, evt.location, blocks, { color: { colorFn: chalk.gray, when: Content.Wall } });
      }

      // Draw Start as Red.
      plotPanelAsBlock(cursor, startLocation, new Map(), { color: { colorFn: chalk.redBright, when: Content.Empty } });

      // Draw Oxygen System as Blue.
      const overlay = new Map();
      plotPanelAsBlock(cursor, droid.oxygenSystem, overlay, { color: { colorFn: chalk.blueBright, when: Content.OxygenSystem } });

      cursor.close('Finished?', droid.foundOxygenSystem);

      console.log(chalk.yellow('Oxygen System: '), droid.oxygenSystem);
      const oxySysdistance = droid.oxygenSystem.distance;
      console.log('Shortest distance from start to oxygen', oxySysdistance.fromStart, (oxySysdistance.fromStart === 294) ? '🏆' : '❌');
      console.log('');

      const furthestDistance = droid.furthestFromOxygen.distance;
      console.log(chalk.yellow('Furthest Point: '), droid.furthestFromOxygen);
      console.log('Furthest distance from oxygen to edge', furthestDistance.fromOxygenSystem, (furthestDistance.fromOxygenSystem === 388) ? '🏆' : '❌');
    } catch (ex) {
      console.error(ex);
    }

  })();
}
