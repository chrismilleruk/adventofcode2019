const { MazeRunner } = require('../lib/mazeRunner')

class LockedMazeRunner extends MazeRunner {
  static async parse(linesAsync, validTileChars = '.@', lockChars = 'ABCDEFGHIJKLM', keyChars = 'abcdefghijklm') {
    const parsedTiles = await MazeRunner.parseTiles(linesAsync, validTileChars, lockChars, keyChars);
  
    const maze = new LockedMazeRunner(parsedTiles, validTileChars, lockChars, keyChars);
    return maze;
  }

  constructor(parsedTiles, validChars, lockChars, keyChars) {
    let allTiles = [...parsedTiles[validChars], ...parsedTiles[keyChars], ...parsedTiles[lockChars]];
    super(allTiles, validChars + keyChars + lockChars);

    this._keyChars = keyChars;
    this._lockChars = lockChars;
  }

  get lockChars() {
    return this._lockChars;
    // return [...this._locks.keys()];
  }

  get keyChars() {
    return this._keyChars;
  }

  linkTiles() {
    super.linkTiles((tile) => this.linkLocksAndKeys(tile))
  }

  linkLocksAndKeys(tile) {
    const maze = this;

    function isKey(tile) {
      if (!tile) return false;
      const idx = maze.keyChars.indexOf(tile.char);
      return idx > -1 && idx < maze.lockChars.length;
    }

    function getKeyLockPair(tile) {
      if (!isKey(tile)) return false;
      const idx = maze.keyChars.indexOf(tile.char);
      return [maze.keyChars[idx], maze.lockChars[idx]]
    }

    function isLocked(tile, state = '') {
      if (!tile) return true;
      const idx = maze.lockChars.indexOf(tile.char);
      return idx > -1 && state.indexOf(tile.char) === -1;
    }

    function createTestStateFn(maze, tile, linkedTile) {
      // return () => true;
      return (state) => !isLocked(tile, state) && !isLocked(linkedTile, state);
    }

    function createChangeStateFn(maze, tile, linkedTile) {
      if (isKey(linkedTile)) {
        let [key, lock] = getKeyLockPair(linkedTile)
        return (state) => {
          if (state.indexOf(lock) === -1) {
            let arr = state.split('');
            arr.push(lock);
            arr.sort();
            state = arr.join('');
            // state/*?*/
          }
          return state;
        };
      }
      return (state) => state;
    }

    function createTileKeyFn(key) {
      function getSmartTileIfUnlocked(maze) {
        const linkedTile = maze.get(key);
        const testStateFn = createTestStateFn(maze, tile, linkedTile);
        const newStateFn = createChangeStateFn(maze, tile, linkedTile);
        return { linkedTile, testStateFn, newStateFn };
      }

      return getSmartTileIfUnlocked;
    }

    return {
      E: createTileKeyFn(String([tile.x + 1, tile.y])),
      W: createTileKeyFn(String([tile.x - 1, tile.y])),
      N: createTileKeyFn(String([tile.x, tile.y - 1])),
      S: createTileKeyFn(String([tile.x, tile.y + 1])),
      // NB: StateFns are directional & specific to `tile` so no reverseLink.
      // _reverseLink: {}
    }
  }
}

module.exports = { LockedMazeRunner };


class LockedMazeRunner_old extends MazeRunner {
  static async parse(linesAsync, validTileChars = '.@', lockChars = 'ABCDEFGHIJKLM', keyChars = 'abcdefghijklm') {
    const parsedTiles = await MazeRunner.parseTiles(linesAsync, validTileChars, lockChars, keyChars);
  
    const maze = new LockedMazeRunner(parsedTiles, validTileChars, lockChars, keyChars);
    return maze;
  
    // let mazeRunner = await MazeRunner.parse(linesAsync, validTileChars + keyChars + lockChars)
    // return new LockedMazeRunner([...mazeRunner.tiles], validTileChars, lockChars, keyChars);
  }

  constructor(parsedTiles, validChars, lockChars, keyChars) {
    let allTiles = [...parsedTiles[validChars], ...parsedTiles[keyChars], ...parsedTiles[lockChars]];
    super(allTiles, validChars);

    allTiles = allTiles.map((tile) => tile.clone());
    this._unlockedMaze = new MazeRunner(allTiles, validChars + keyChars + lockChars);
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
