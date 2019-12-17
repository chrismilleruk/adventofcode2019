const { loadIntcodeFile } = require('../lib/loadIntcode');
const { arcadeInstructions, arcadeGame } = require('./arcadeGame');

const filename = __dirname + '/input.txt';

describe('Day 13: Care Package', () => {
  test('How many block tiles are on the screen when the game exits?', async () => {
    const program = await loadIntcodeFile(filename);
    const tiles = new Map();
    for await (const instr of arcadeInstructions(program)) {
      let key = String(instr.slice(0, 2));
      tiles.set(key, instr);
    }

    let countBlocks = 0;
    for (let tile of tiles.values()) {
      // 0 is an empty tile. No game object appears in this tile.
      // 1 is a wall tile. Walls are indestructible barriers.
      // 2 is a block tile. Blocks can be broken by the ball.
      // 3 is a horizontal paddle tile. The paddle is indestructible.
      // 4 is a ball tile. The ball moves diagonally and bounces off objects.
      if (tile[2] === 2) {
        countBlocks += 1;
      }
    }

    expect(countBlocks).toBe(376);
  })
})
