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
      await part2();

    } catch (ex) {
      console.error(ex);
    }
  })();
}

async function part1() {
  console.log(chalk.yellowBright(`How many steps does it take to get from the open tile marked AA to the open tile marked ZZ?`));
  let t0 = Date.now();

  let gridSize = [110, 106];

  
  let cursor;
  if (process.stdout.rows > gridSize[1]/2) {
    cursor = preparePlotArea(process.stdout, gridSize[0] / 2, gridSize[1] / 2);
    cursor.setOffset({ x: 0, y: -1 });
    cursor.moveTo(0, 0);
  }
  
  const mazeLabelChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const mazeValidChars = '.@';
  const linesAsync = createStreamFromFile(filename, false)
  const maze = await TeleportMazeRunner.parse(linesAsync, mazeValidChars, mazeLabelChars);

  maze.linkTiles();

  let panelMap = new Map();
  if (cursor) {
    for await (const tile of maze.tiles)
    {
      let panel = new Panel(tile.x, tile.y, 1)
      plotPanelAsBlock(cursor, panel, panelMap);
    }
    panelMap.clear();
    let metadata = maze.getDistanceMeta('AA');
    for await (const meta of metadata.values())
    {
      if (!meta.tile) {
        // throw `no tile ${meta}`
        continue;
      }

      let panel = new Panel(meta.tile.x, meta.tile.y, 1)
      plotPanelAsBlock(cursor, panel, panelMap, { color: { colorFn: chalk.blue, when: 1 }});
    }
    // panelMap.clear();
    for await (const tile of maze._aliases.values())
    {
      let panel = new Panel(tile.x, tile.y, 1)
      plotPanelAsBlock(cursor, panel, panelMap, { color: { colorFn: chalk.red, when: 1 }});
    }
  }

  let shortestRoutes = maze.shortestRoutes('AA', 'ZZ');

  if (cursor) {
    for await (const tileKey of shortestRoutes[0])
    {
      let tile = maze.get(tileKey);
      let panel = new Panel(tile.x, tile.y, 1)
      plotPanelAsBlock(cursor, panel, panelMap, { color: { colorFn: chalk.yellow, when: 1 }});
    }
  }

  let shortestDistance = maze.shortestDistance('AA', 'ZZ');

  if (cursor) {
    cursor.close('Distance', shortestDistance);
  }

  console.log('Shortest Distance from AA to ZZ', shortestDistance, (shortestDistance === 442) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
  console.log(shortestRoutes[0].filter(key => maze._aliases.has(key)));
}

async function part2() {
  console.log(chalk.yellowBright(`When accounting for recursion, how many steps does it take to get from the open tile marked AA to the open tile marked ZZ, both at the outermost layer?`));
  let t0 = Date.now();

  let result = false;
  const mazeLabelChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const mazeValidChars = '.@';
  const linesAsync = createStreamFromFile(filename, false)
  const maze = await TeleportMazeRunner.parse(linesAsync, mazeValidChars, mazeLabelChars);

  maze.linkTiles(TeleportMazeRunner.generateTeleportFns);

  let shortestDistance = maze.shortestDistance('AA', 'ZZ', 0, 0);
  console.log('Shortest Distance from AA(0) to ZZ(0)', shortestDistance, (shortestDistance === 5208) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));

  let shortestRoutes = maze.shortestRoutes('AA', 'ZZ', 0, 0);
  console.log(shortestRoutes[0].filter(key => maze._aliases.has(key)));
}
