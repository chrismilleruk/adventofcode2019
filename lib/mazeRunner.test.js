const { MazeRunner } = require('./mazeRunner')
const { createStreamFromString } = require('../lib/createStream')

describe('Maze Runner', () => {
  const mazeValidChars = '.abcdefghijkl';

  describe('maze U - 2 dead ends, no junctions', () => {
    const maze1 = `
    ###########
    #a..b....c#
    #########.#
    #d..e....f#
    ###########
    `;

    test('constructor', () => {
      const instance = new MazeRunner([]);

      expect(instance).toBeInstanceOf(MazeRunner)
    })

    test('parse', async () => {
      const linesAsync = createStreamFromString(maze1)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      expect(maze).toBeInstanceOf(MazeRunner)
      expect([...maze.tiles]).toHaveLength(19);
    })

    test('shortestDistance, maze1', async () => {
      const linesAsync = createStreamFromString(maze1)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      maze.linkTiles();
      let shortestDistance;

      shortestDistance = maze.shortestDistance('a', 'b');
      expect(shortestDistance).toEqual(3);

      shortestDistance = maze.shortestDistance('a', 'd');
      expect(shortestDistance).toEqual(18);

      shortestDistance = maze.shortestDistance('a', 'f');
      expect(shortestDistance).toEqual(10);
    })

    test('shortestRoute', async () => {
      const linesAsync = createStreamFromString(maze1)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      maze.linkTiles();
      let shortestRoutes;

      shortestRoutes = maze.shortestRoutes('a', 'b');
      expect(shortestRoutes).toEqual([['a', '2,1', '3,1', 'b']]);

      shortestRoutes = maze.shortestRoutes('a', 'd');
      expect(shortestRoutes).toEqual([
        ['a', '2,1', '3,1', 'b', '5,1', '6,1', '7,1', '8,1', 'c', '9,2',
          'f', '8,3', '7,3', '6,3', '5,3', 'e', '3,3', '2,3', 'd']
      ]);

      shortestRoutes = maze.shortestRoutes('a', 'f');
      expect(shortestRoutes).toEqual([
        ['a', '2,1', '3,1', 'b', '5,1', '6,1', '7,1', '8,1', 'c', '9,2', 'f']
      ]);
    })

  })

  describe('maze H - 4 dead ends, 2 junctions', () => {
    const maze2 = `
    ###########
    #a..b....c#
    ####.######
    #d..e....f#
    ###########
    `;

    test('shortestDistance, maze2', async () => {
      const linesAsync = createStreamFromString(maze2)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      maze.linkTiles();
      let shortestDistance;

      shortestDistance = maze.shortestDistance('a', 'b');
      expect(shortestDistance).toEqual(3);

      shortestDistance = maze.shortestDistance('a', 'd');
      expect(shortestDistance).toEqual(8);

      shortestDistance = maze.shortestDistance('a', 'f');
      expect(shortestDistance).toEqual(10);

      shortestDistance = maze.shortestDistance('c', 'f');
      expect(shortestDistance).toEqual(12);
    })

    test('shortestRoute', async () => {
      const linesAsync = createStreamFromString(maze2)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      maze.linkTiles();
      let shortestRoutes;

      shortestRoutes = maze.shortestRoutes('a', 'b');
      expect(shortestRoutes).toEqual([['a', '2,1', '3,1', 'b']]);

      shortestRoutes = maze.shortestRoutes('a', 'd');
      expect(shortestRoutes).toEqual([
        ['a', '2,1', '3,1', 'b', '4,2', 'e', '3,3', '2,3', 'd']
      ]);

      shortestRoutes = maze.shortestRoutes('a', 'f');
      expect(shortestRoutes).toEqual([
        ['a', '2,1', '3,1', 'b', '4,2', 'e', '5,3', '6,3', '7,3', '8,3', 'f']
      ]);
    })

  })

  describe('maze oo - 2 loops, 2 junctions', () => {
    const maze3 = `
    ###########
    #a..b....c#
    #.##.####g#
    #d..e...hf#
    ###########
    `;

    test('shortestDistance, maze3', async () => {
      const linesAsync = createStreamFromString(maze3)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      maze.linkTiles();
      let shortestDistance;

      shortestDistance = maze.shortestDistance('a', 'b');
      expect(shortestDistance).toEqual(3);

      shortestDistance = maze.shortestDistance('a', 'd');
      expect(shortestDistance).toEqual(2);

      shortestDistance = maze.shortestDistance('a', 'f');
      expect(shortestDistance).toEqual(10);

      shortestDistance = maze.shortestDistance('a', 'g');
      expect(shortestDistance).toEqual(9);

      shortestDistance = maze.shortestDistance('a', 'h');
      expect(shortestDistance).toEqual(9);
    })

    test('shortestRoute', async () => {
      const linesAsync = createStreamFromString(maze3)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      maze.linkTiles();
      let shortestRoutes;

      shortestRoutes = maze.shortestRoutes('a', 'b');
      expect(shortestRoutes).toEqual([['a', '2,1', '3,1', 'b']]);

      shortestRoutes = maze.shortestRoutes('a', 'd');
      expect(shortestRoutes).toEqual([
        ['a', '1,2', 'd']
      ]);

      shortestRoutes = maze.shortestRoutes('a', 'f');
      expect(shortestRoutes).toEqual([
        ['a', '2,1', '3,1', 'b', '5,1', '6,1', '7,1', '8,1', 'c', 'g', 'f'],
        ['a', '2,1', '3,1', 'b', '4,2', 'e', '5,3', '6,3', '7,3', 'h', 'f'],
        ['a', '1,2', 'd', '2,3', '3,3', 'e', '5,3', '6,3', '7,3', 'h', 'f']
      ]);
    })

  })

  describe('maze oooo - 4 loops, 6 junctions', () => {
    const maze4 = `
    ###########
    #a..b....c#
    #.#.#.#.#g#
    #d..e...hf#
    ###########
    `;

    test('shortestDistance, maze4', async () => {
      const linesAsync = createStreamFromString(maze4)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      maze.linkTiles();
      let shortestDistance;

      shortestDistance = maze.shortestDistance('a', 'b');
      expect(shortestDistance).toEqual(3);

      shortestDistance = maze.shortestDistance('a', 'c');
      expect(shortestDistance).toEqual(8);

      shortestDistance = maze.shortestDistance('a', 'd');
      expect(shortestDistance).toEqual(2);

      shortestDistance = maze.shortestDistance('a', 'e');
      expect(shortestDistance).toEqual(5);

      shortestDistance = maze.shortestDistance('a', 'f');
      expect(shortestDistance).toEqual(10);

      shortestDistance = maze.shortestDistance('a', 'g');
      expect(shortestDistance).toEqual(9);

      shortestDistance = maze.shortestDistance('a', 'h');
      expect(shortestDistance).toEqual(9);
    })

    test('shortestRoute', async () => {
      const linesAsync = createStreamFromString(maze4)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      maze.linkTiles();
      let shortestRoutes;

      shortestRoutes = maze.shortestRoutes('a', 'b');
      expect(shortestRoutes).toEqual([['a', '2,1', '3,1', 'b']]);

      shortestRoutes = maze.shortestRoutes('a', 'd');
      expect(shortestRoutes).toEqual([
        ['a', '1,2', 'd']
      ]);

      shortestRoutes = maze.shortestRoutes('a', 'f');
      expect(shortestRoutes).toEqual([
        ['a', '2,1', '3,1', 'b', '5,1', '6,1', '7,1', '8,1', 'c', 'g', 'f'],
        ['a', '2,1', '3,1', 'b', '5,1', '6,1', '7,1', '7,2', '7,3', 'h', 'f'],
        ['a', '2,1', '3,1', 'b', '5,1', '5,2', '5,3', '6,3', '7,3', 'h', 'f'],
        ['a', '2,1', '3,1', '3,2', '3,3', 'e', '5,3', '6,3', '7,3', 'h', 'f'],
        ['a', '1,2', 'd', '2,3', '3,3', 'e', '5,3', '6,3', '7,3', 'h', 'f'],
      ]);
    })
  })

  describe('Dynamic maze - Add Tiles & Links', () => {
    const mazeLockChars = 'A';
    const mazeKeyChars = 'ab';
    const mazeValidChars = '.@' + mazeKeyChars;
    const maze5 = `
    #########
    #b.A.@.a#
    #########
    `;
    test('addTile', async () => {
      const linesAsync = createStreamFromString(maze5)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      maze.linkTiles();

      // mazeValidChars = '.@ab' (which excludes 'A')

      // A is skipped so maze looks like this:
      // #########
      // #b.#.@.a#
      // #########
      expect(maze.shortestDistance('@', 'b')).toEqual(-1)
      expect(maze.shortestDistance('@', 'a')).toEqual(2)
      expect(maze.shortestDistance('a', 'b')).toEqual(-1)

      const tile = maze.get('@');
      maze.addTileAt(tile.x - 2, tile.y, 'A');

      // A is added so maze now looks like this:
      // #########
      // #b...@.a#
      // #########
      expect(maze.shortestDistance('@', 'b')).toEqual(4)
      expect(maze.shortestDistance('@', 'a')).toEqual(2)
      expect(maze.shortestDistance('a', 'b')).toEqual(6)
    })
    test('addLink(tile, tile)', async () => {
      const linesAsync = createStreamFromString(maze5)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      maze.linkTiles();

      // mazeValidChars = '.@ab' (which excludes 'A')

      // A is skipped so maze looks like this:
      // #########
      // #b.#.@.a#
      // #########
      expect(maze.shortestDistance('@', 'b')).toEqual(-1)

      // Create a teleport link between 'a' and 'b'
      const tile1 = maze.get('a');
      const tile2 = maze.get('b');
      maze.addLink(tile1, tile2, 'teleport');

      // 'a' and 'b' are linked so Maze effectively looks like this:
      // ########
      // #b.#.@.a#######
      // #######b.#.@.a#
      //       #########
      expect(maze.shortestDistance('@', 'b')).toEqual(3)
    })
    test('addLink(tileKey, tileKey)', async () => {
      const linesAsync = createStreamFromString(maze5)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      maze.linkTiles();

      // mazeValidChars = '.@ab' (which excludes 'A')

      // A is skipped so maze looks like this:
      // #########
      // #b.#.@.a#
      // #########
      expect(maze.shortestDistance('@', 'b')).toEqual(-1)

      // Create a teleport link between 'a' and 'b'
      maze.addLink('a', 'b', 'teleport');

      // 'a' and 'b' are linked so Maze effectively looks like this:
      // ########
      // #b.#.@.a#######
      // #######b.#.@.a#
      //       #########
      expect(maze.shortestDistance('@', 'b')).toEqual(3)
    })
    test('clearCache', async () => {
      const linesAsync = createStreamFromString(maze5)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      maze.linkTiles();

      // mazeValidChars = '.@ab' (which excludes 'A')

      // A is skipped so maze looks like this:
      // #########
      // #b.#.@.a#
      // #########
      expect(maze.shortestDistance('@', 'b')).toEqual(-1)

      // Manually create a teleport link between 'a' and 'b'
      const tile1 = maze.get('a');
      const tile2 = maze.get('b');
      tile1.linkTo(tile2, 'teleport');
      tile2.linkTo(tile1, 'teleport');

      // 'a' and 'b' are linked so Maze effectively looks like this:
      // ########
      // #b.#.@.a#######
      // #######b.#.@.a#
      //       #########

      // This is not possible because the maze has a cache.
      expect(maze.shortestDistance('@', 'b')).toEqual(-1)

      maze.cacheClear()
      expect(maze.shortestDistance('@', 'b')).toEqual(3)
    })
    test('addLink (conditional)', async () => {
      const linesAsync = createStreamFromString(maze5)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars + mazeLockChars);

      maze.linkTiles(linkLocksAndKeys);

      // mazeValidChars = '.@abA'
      // 'A' is excluded by the LinkFn above.

      // A is locked so maze looks like this:
      // #########
      // #b.#.@.a#
      // #########
      expect(maze.shortestDistance('@', 'b')).toEqual(-1)
      // expect(maze.shortestDistance('@', 'a', 'A')).toEqual(2)
      expect(maze.shortestDistance('a', 'b')).toEqual(-1)

      // With A unlocked, maze looks like this:
      // #########
      // #b.A.@.a#
      // #########
      expect(maze.shortestDistance('@', 'b', 'A')).toEqual(4)
      expect(maze.shortestDistance('@', 'a', 'A')).toEqual(2)
      expect(maze.shortestDistance('a', 'b', 'A')).toEqual(6)

      // Maze has the ability to route across states.
      expect(maze.shortestDistance('@', 'a', '', 'A')).toEqual(2)
      expect(maze.shortestDistance('@', 'b', '', 'A')).toEqual(8)
    })

    function linkLocksAndKeys(tile) {
      function isKey(tile) {
        if (!tile) return false;
        const idx = mazeKeyChars.indexOf(tile.char);
        return idx > -1 && idx < mazeLockChars.length;
      }

      function isLocked(tile, state = '') {
        if (!tile) return true;
        const idx = mazeLockChars.indexOf(tile.char);
        return idx > -1 && state.indexOf(tile.char) === -1;
      }

      function createTestStateFn(maze, tile, linkedTile) {
        // return () => true;
        return (state) => !isLocked(tile, state) && !isLocked(linkedTile, state);
      }

      function createChangeStateFn(maze, tile, linkedTile) {
        if (isKey(linkedTile)) {
          // linkedTile;/*?*/
          return (state) => {
            if (state.indexOf('A') === -1) {
              state += 'A';
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
        // NB: StateFns are directional & specific to `tile` so no reverseLink.
        // _reverseLink: {}
      }
    }
  
  })
})

// describe('Multimap', () => {
//   test('set', () => {
//     const map = new MultiMap();
//     map.set(['a'], 'A');

//     map.set(['b', 'b'], 'A');


//   })
//   test('get', () => {
    
//   })
//   test('has', () => {
    
//   })
// })

// class MultiMap extends Map {

//   set(key, value) {
//     // key is Array.
//     let map = this;
//     let part = key.shift();
//     while (typeof map !== 'undefined' && typeof part !== 'undefined') {
//       if (key.length == 0) {
//         if (map === this) {
//           super.set(part, value);
//         } else {
//           map.set(part, value);
//         }
//         break;
//       }

//       let map2 = map.get(part);
//       if (typeof map2 === 'undefined') {
//         map2 = new Map();
//         map.set(part, new Map());
//       }
//       map = map2;

//       part = key.shift();
//     }
//   }

//   get(key) {
//     // key is Array.
//     let map = this;
//     let part = key.shift()
//     while (map && part) {
//       map = map.get(part)
//       part = key.shift();
//     }
//     if (typeof part === 'undefined') {
//       return map;
//     } 
//   }

//   has(key) {
//     // key is Array.
//     let map = this;
//     let part = key.shift()
//     while (map && part) {
//       map = map.get(part)
//       part = key.shift();
//     }
//     return typeof part === 'undefined' && typeof map !== 'undefined';
//   }
// }
