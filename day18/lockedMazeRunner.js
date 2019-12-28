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
    for (const char of lockChars) {
      const tile = this._aliases.get(char);
      if (tile) {
        this._locks.set(char, tile);
        this._tiles.delete(tile.key);
        this._aliases.delete(tile.id);
      }
    }

    this._lockKeyMap = new Map();
    this._keyLockMap = new Map();
    [...lockChars].forEach((lockChar, idx) => {
      let keyChar = keyChars[idx];
      this._lockKeyMap.set(lockChar, keyChar);
      this._keyLockMap.set(keyChar, lockChar);
    });
  }

  get lockChars() {
    return [...this._locks.keys()];
  }

  getLocksOnRoute(route) {
    let array = route.map(char => this.lockChars.indexOf(char))
      .filter(idx => idx > -1)
      .map(idx => this.lockChars[idx])
      .map(lockId => [this._lockKeyMap.get(lockId), lockId]);
    return new Map(array);
  }

  getKeysOnRoute(route) {
    return route.filter(char => this._keys.has(char));
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
    return true;
  }

  useKey(keyId) {
    const lockId = this._keyLockMap.get(keyId);
    const lockedTile = this._locks.get(lockId);
    if (lockedTile && !this.unlockTile(lockId)) {
      throw `Unable to unlock lock (${lockId}) with key (${keyId})`;
    }
    this._keys.delete(keyId);
  }

  useKeysOnRoute(route) {
    for(const key of this.getKeysOnRoute(route)) {
      this.useKey(key);
    }
  }
}

module.exports = { LockedMazeRunner };
