const { LockedMazeRunner } = require('./lockedMazeRunner')
const { createStreamFromString } = require('../lib/createStream')

describe('Maze With Keys', () => {
  const mazeLockChars = 'ABCDEFG';
  const mazeKeyChars = 'abcdefg';
  const mazeValidChars = '.@';

  describe('Day 18, example 1', () => {
    // For example, suppose you have the following map:
    // #########
    // #b.A.@.a#
    // #########
    // Starting from the entrance (@), you can only access a large door (A) and a key (a). Moving toward the door doesn't help you, but you can move 2 steps to collect the key, unlocking A in the process:
    // #########
    // #b.....@#
    // #########
    // Then, you can move 6 steps to collect the only other key, b:
    // #########
    // #@......#
    // #########
    // So, collecting every key took a total of 8 steps.

    const example1 = `
    #########
    #b.A.@.a#
    #########
    `;

    test('Locked maze cannot navigate from @ to b', async () => {
      const linesAsync = createStreamFromString(example1)
      const mazeLocked = await LockedMazeRunner.parse(linesAsync, mazeValidChars, mazeLockChars, mazeKeyChars);

      mazeLocked.linkTiles();

      let shortestDistance = mazeLocked.shortestDistance('@', 'b');
      expect(shortestDistance).toEqual(-1);

      let shortestRoutes = mazeLocked.shortestRoutes('@', 'b');
      expect(shortestRoutes).toEqual([]);
    })

    test('Inner Unlocked maze *can* navigate from @ to b', async () => {
      const linesAsync = createStreamFromString(example1)
      const mazeLocked = await LockedMazeRunner.parse(linesAsync, mazeValidChars, mazeLockChars, mazeKeyChars);

      mazeLocked.linkTiles();

      let shortestDistance = mazeLocked.shortestDistance('@', 'b', 'A');
      expect(shortestDistance).toEqual(4);

      let shortestRoutes = mazeLocked.shortestRoutes('@', 'b', 'A');
      expect(shortestRoutes).toEqual([
        ['@', '4,1', 'A', '2,1', 'b']
      ]);
    })

    test.skip('Shortest Routes (locked and unlocked)', async () => {
      const linesAsync = createStreamFromString(example1)
      const mazeLocked = await LockedMazeRunner.parse(linesAsync, mazeValidChars, mazeLockChars, mazeKeyChars);
      mazeLocked.linkTiles();

      let shortestRoutes;

      shortestRoutes = mazeLocked.shortestRoutes('@', 'b');
      expect(shortestRoutes).toEqual([]);
      
      shortestRoutes = mazeLocked.shortestUnlockedRoutes('@', 'b');
      expect(shortestRoutes).toEqual([
        ['@', '4,1', 'A', '2,1', 'b']
      ]);

      shortestRoutes = mazeLocked.shortestRoutes('@', 'b');
      expect(shortestRoutes).toEqual([]);
    })

    test.skip('Unlock single tile', async () => {
      const linesAsync = createStreamFromString(example1)
      const maze = await LockedMazeRunner.parse(linesAsync, mazeValidChars, mazeLockChars, mazeKeyChars);
      maze.linkTiles();

      let shortestDistance = maze.shortestDistance('@', 'b');
      expect(shortestDistance).toEqual(-1);

      maze.unlockTile('A')

      shortestDistance = maze.shortestDistance('@', 'b');
      expect(shortestDistance).toEqual(4);
    })

    test.skip('Unlock doors', async () => {
      const linesAsync = createStreamFromString(example1)
      const maze = await LockedMazeRunner.parse(linesAsync, mazeValidChars, mazeLockChars, mazeKeyChars);
      maze.linkTiles();

      let shortestDistance = maze.shortestDistance('@', 'b');
      expect(shortestDistance).toEqual(-1);

      let routes = maze.shortestUnlockedRoutes('@', 'b');
      let doors = routes[0].filter(char => maze.lockChars.indexOf(char) > -1);

      expect(doors).toEqual(['A']);

      for (const door of doors) {
        maze.unlockTile(door)
      }

      shortestDistance = maze.shortestDistance('@', 'b');
      expect(shortestDistance).toEqual(4);
    })

    test.skip('Find & use keys', async () => {
      const linesAsync = createStreamFromString(example1)
      const maze = await LockedMazeRunner.parse(linesAsync, mazeValidChars, mazeLockChars, mazeKeyChars);
      maze.linkTiles();

      let segments = [];

      let shortestUnlockedRoutes = maze.shortestUnlockedRoutes('@', 'b');
      let doorsToUnlock = maze.getLocksOnRoute(shortestUnlockedRoutes[0]);

      let routes;

      let key = [...doorsToUnlock.keys()][0];
      routes = maze.shortestRoutes('@', key);
      segments.push(routes[0]);
      maze.useKeysOnRoute(routes[0])

      routes = maze.shortestRoutes(key, 'b');
      segments.push(routes[0]);
      maze.useKeysOnRoute(routes[0])

      expect(segments).toEqual([
        ['@', '6,1', 'a'],
        ['a', '6,1', '@', '4,1', 'A', '2,1', 'b']
      ]);
      
      let totalDistance = segments.map(s => s.length - 1).reduce((p,c) => p+c)
      expect(totalDistance).toBe(8);
    })
  })

  describe('Day 18, example 2', () => {
    const example2 = `
    ########################
    #f.D.E.e.C.b.A.@.a.B.c.#
    ######################.#
    #d.....................#
    ########################
    `;
    // ########################
    // #f...E.e...............#
    // ######################.#
    // #@.....................#
    // ########################
    // Finally, collect key e to unlock door E, then collect key f, taking a grand total of 86 steps.

    test('Locked maze can navigate from @ to f', async () => {
      const linesAsync = createStreamFromString(example2)
      const mazeLocked = await LockedMazeRunner.parse(linesAsync, mazeValidChars, mazeLockChars, mazeKeyChars);

      mazeLocked.linkTiles();

      let shortestDistance = mazeLocked.shortestDistance('@', 'f', '', 'ABCDEF');
      expect(shortestDistance).toEqual(86);

      let shortestRoutes = mazeLocked.shortestRoutes('@', 'f', '', 'ABCDEF');
      expect(shortestRoutes).toEqual([]);
    })
  })
})
