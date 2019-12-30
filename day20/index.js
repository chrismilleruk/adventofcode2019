const { TeleportMazeRunner } = require('./teleportMazeRunner')
const { createStreamFromFile } = require('../lib/createStream')
const { preparePlotArea, plotPanelAsBlock, Panel } = require('../lib/render');

const filename = __dirname + '/input.txt';

const readlineSync = require('readline-sync')
const chalk = require('chalk');

if (require.main === module) {
  (async () => {
    try {
      await part1();
      // await part2();

    } catch (ex) {
      console.error(ex);
    }
  })();
}

async function part1() {
  console.log(chalk.yellowBright(`How many steps does it take to get from the open tile marked AA to the open tile marked ZZ?`));
  let t0 = Date.now();

  let gridSize = [110, 106]

  const cursor = preparePlotArea(process.stdout, gridSize[0] / 2, gridSize[1] / 2);
  cursor.setOffset({ x: 0, y: -1 });
  cursor.moveTo(0, 0);
  
  const mazeLabelChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const mazeValidChars = '.@';
  const linesAsync = createStreamFromFile(filename, false)
  const maze = await TeleportMazeRunner.parse(linesAsync, mazeValidChars, mazeLabelChars);

  maze.linkTiles();

  let panelMap = new Map();
  for await (const tile of maze.tiles)
  {
    let panel = new Panel(tile.x, tile.y, 1)
    plotPanelAsBlock(cursor, panel, panelMap);
  }
  panelMap.clear();
  let metadata = maze.getDistanceMeta('AA');
  for await (const meta of metadata.values())
  {
    let panel = new Panel(meta.tile.x, meta.tile.y, 1)
    plotPanelAsBlock(cursor, panel, panelMap, { x:0, y:0}, { color: chalk.blue, value: 1 });
  }
  // panelMap.clear();
  for await (const tile of maze._aliases.values())
  {
    let panel = new Panel(tile.x, tile.y, 1)
    plotPanelAsBlock(cursor, panel, panelMap, { x:0, y:0}, { color: chalk.red, value: 1 });
  }

  let shortestRoutes = maze.shortestRoutes('AA', 'ZZ');
  for await (const tileKey of shortestRoutes[0])
  {
    let tile = maze.get(tileKey);
    let panel = new Panel(tile.x, tile.y, 1)
    plotPanelAsBlock(cursor, panel, panelMap, { x:0, y:0}, { color: chalk.yellow, value: 1 });
  }

  let shortestDistance = maze.shortestDistance('AA', 'ZZ');
  cursor.close('Distance', shortestDistance);

  console.log(shortestRoutes[0].filter(key => maze._aliases.has(key)));
  console.log(shortestRoutes[0].filter(key => maze._aliases.has(key)).map(key => {
    let tile = maze.get(key);
    return [key, metadata.get(tile.key).distance];
  }))
  // console.log('Points affected', totalAffected, (totalAffected === 203) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}

async function part2() {
  console.log(chalk.yellowBright(`Find the ...`));
  let t0 = Date.now();

  let result = false;

  console.log('Find the ...', result, (result === true) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}
