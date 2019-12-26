const { DroneSystem } = require('./droneSystem');
const { preparePlotArea, plotPanelAsBlock } = require('../lib/render');

const filename = __dirname + '/input.txt';
const readlineSync = require('readline-sync')
const chalk = require('chalk');

if (require.main === module) {
  (async () => {
    try {
      await part1();

    } catch (ex) {
      console.error(ex);
    }
  })();
}

async function part1() {
  console.log(chalk.yellowBright(`How many points are affected by the tractor beam in the 50x50 area closest to the emitter?`));
  let t0 = Date.now();

  const cursor = preparePlotArea(process.stdout, 55 / 2, 60 / 2);
  cursor.setOffset({ x: 0, y: 0 });
  cursor.moveTo(0, 0);
  
  const droneSystem = new DroneSystem(filename);
  await droneSystem.loadTractorBeamTestProgram();
  let panelMap = new Map();
  let totalAffected = 0;

  for await (const panel of droneSystem.testGrid(50, 50))
  {
    plotPanelAsBlock(cursor, panel, panelMap);
    if (panel.color === 1) {
      totalAffected += 1;
    }
  }

  cursor.close('Affected', totalAffected);
  console.log('Points affected', totalAffected, (totalAffected === 203) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}
