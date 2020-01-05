const { MazeRunner } = require('../lib/mazeRunner')

class LockedMazeRunner extends MazeRunner {
  static async parse(linesAsync, validTileChars = '.@', lockChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', keyChars = 'abcdefghijklmnopqrstuvwxyz') {
    const parsedTiles = await MazeRunner.parseTiles(linesAsync, validTileChars, lockChars, keyChars);
  
    const maze = new LockedMazeRunner(parsedTiles, validTileChars, lockChars, keyChars);
    return maze;
  }

  constructor(parsedTiles, validChars, lockChars, keyChars) {
    let allTiles = [...parsedTiles[validChars], ...parsedTiles[keyChars], ...parsedTiles[lockChars]];
    super(allTiles, validChars + keyChars + lockChars);

    this._keyChars = parsedTiles[keyChars].map(t => t.char).sort().join('');
    this._lockChars = parsedTiles[lockChars].map(t => t.char).sort().join('');
  }

  get lockChars() {
    return this._lockChars;
  }

  get keyChars() {
    return this._keyChars;
  }

  linkTiles() {
    super.linkTiles((tile) => this.linkLocksAndKeys(tile))
  }

  linkLocksAndKeys(tile) {
    const maze = this;

    function isKeyTile(tile) {
      if (!tile) return false;
      const idx = maze.keyChars.indexOf(tile.char);
      return idx > -1;
    }

    function isLockTile(tile) {
      if (!tile) return false;
      const idx = maze.lockChars.indexOf(tile.char);
      return idx > -1;
    }

    function getKeyLockPair(tile) {
      const char = tile.char;
      const keys = maze.keyChars;
      const locks = maze.lockChars;
      let key = false, lock = false;

      if (keys.indexOf(char) > -1) {
        key = char;
        if (locks.indexOf(key.toUpperCase()) > -1) {
          lock = key.toUpperCase();
        }
      } else if (locks.indexOf(char) > -1) {
        lock = char;
        if (keys.indexOf(lock.toLowerCase()) > -1) {
          key = lock.toLowerCase();
        }
      }
      
      return [key, lock];
    }

    function isLocked(tile, state = '') {
      if (!tile) return true;
      if (!isLockTile(tile)) return false;
      let [key, lock] = getKeyLockPair(tile);
      return !!lock && state.indexOf(key) === -1;
    }

    function createCanVisitFn(maze, tile, linkedTile) {
      return (state) => !isLocked(tile, state) && !isLocked(linkedTile, state);
    }

    function createOnVisitFn(maze, tile, linkedTile) {
      if (!isKeyTile(linkedTile)) {
        return defaultOnVisitFn;
      } else {
        return keyTileOnVisitFn;
      }

      function defaultOnVisitFn(state) {
        return state; 
      }

      function keyTileOnVisitFn(state) {
        let [key, lock] = getKeyLockPair(linkedTile)
      
        if (key && state.indexOf(key) === -1) {
          let arr = state.split('');
          arr.push(key);
          arr.sort();
          state = arr.join('');
        }

        return state;
      }
    }

    function conditionalLink(key) {
      function getSmartLink(maze) {
        const linkedTile = maze.get(key);
        if (linkedTile === undefined) return {};
        const canVisit = createCanVisitFn(maze, tile, linkedTile);
        const onVisit = createOnVisitFn(maze, tile, linkedTile);
        return { linkedTile, fns: { canVisit, onVisit } };
      }

      return getSmartLink;
    }

    return {
      E: conditionalLink(String([tile.x + 1, tile.y])),
      W: conditionalLink(String([tile.x - 1, tile.y])),
      N: conditionalLink(String([tile.x, tile.y - 1])),
      S: conditionalLink(String([tile.x, tile.y + 1])),
      // NB: StateFns are directional & specific to `tile` so no reverseLink.
      // _reverseLink: {}
    }
  }
}

module.exports = { LockedMazeRunner };
