const { MazeRunner } = require('../lib/mazeRunner')

class LockedMazeRunner extends MazeRunner {
  static async parse(linesAsync, validChars = '.@', lockChars = 'ABCDEFGHIJKLM', keyChars = 'abcdefghijklm') {
    let mazeRunner = await MazeRunner.parse(linesAsync, validChars + keyChars + lockChars)
    return new LockedMazeRunner([...mazeRunner.tiles], validChars, lockChars, keyChars);
  }

  constructor(tiles, validChars, lockChars, keyChars) {
    super(tiles, validChars);

    tiles = tiles.map((tile) => tile.clone());
    this._unlockedMaze = new MazeRunner(tiles, validChars + keyChars + lockChars);
    this._unlockedMaze.linkTiles();
    
    this._keys = new Map();
    for (const char of keyChars) {
      const tile = this._aliases.get(char);
      if (tile) {
        this._keys.set(char, tile);
      }
    }
    
    this._locks = new Map();
    this._lockChars = '';
    for (const char of lockChars) {
      const tile = this._aliases.get(char);
      if (tile) {
        this._locks.set(char, tile);
        this._lockChars += char;
        this._tiles.delete(tile.key);
        this._aliases.delete(tile.id);
      }
    }
  }

  get lockChars() {
    return this._lockChars;
  }

  shortestUnlockedRoutes(fromKey, toKey, maxSteps) {
    let routes = this._unlockedMaze.shortestRoutes(fromKey, toKey, maxSteps);
    return routes;
  }

  unlockTile(lockId) {
    const lockedTile = this._locks.get(lockId);
    if (!lockedTile) return false;
    this.addTile(lockedTile);
    this._locks.delete(lockId);
  }

}

module.exports = { LockedMazeRunner };
