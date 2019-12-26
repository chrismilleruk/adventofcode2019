const { DroneSystem } = require('./droneSystem');
const { preparePlotArea, plotPanelAsBlock } = require('../lib/render');

const filename = __dirname + '/input.txt';
const readlineSync = require('readline-sync')
const chalk = require('chalk');

if (require.main === module) {
  (async () => {
    try {
      await part1();
      await part2();

    } catch (ex) {
      console.error(ex);
    }
  })();
}

async function part1() {
  console.log(chalk.yellowBright(`How many points are affected by the tractor beam in the 50x50 area closest to the emitter?`));
  let t0 = Date.now();

  let gridSize = [50, 50]

  const cursor = preparePlotArea(process.stdout, gridSize[0] / 2, gridSize[1] / 2);
  cursor.setOffset({ x: 0, y: 0 });
  cursor.moveTo(0, 0);
  
  const droneSystem = new DroneSystem(filename);
  await droneSystem.loadTractorBeamTestProgram();
  let panelMap = new Map();
  let totalAffected = 0;

  for await (const panel of droneSystem.testGrid(gridSize[0], gridSize[1]))
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

async function part2() {

  console.log(chalk.yellowBright(`Find the 100x100 square closest to the emitter that fits entirely within the tractor beam`));
  let t0 = Date.now();


  const droneSystem = new DroneSystem(filename);
  await droneSystem.loadTractorBeamTestProgram();

  const coord = await droneSystem.findSpaceFor(100, 100, 10000);

  console.log('Find the point closest to the emitter', coord); //, (coord === [877, 1057]) ? '🏆' : '❌');
  let result = coord[0] * 10000 + coord[1];
  console.log('X coordinate, multiply it by 10000, then add Y coordinate', result, (result === 8771057) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}
