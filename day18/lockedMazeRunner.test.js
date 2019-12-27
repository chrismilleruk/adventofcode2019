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

      let shortestDistance = mazeLocked._unlockedMaze.shortestDistance('@', 'b');
      expect(shortestDistance).toEqual(4);

      let shortestRoutes = mazeLocked._unlockedMaze.shortestRoutes('@', 'b');
      expect(shortestRoutes).toEqual([
        ['@', '4,1', 'A', '2,1', 'b']
      ]);
    })

    test('Shortest Routes (locked and unlocked)', async () => {
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

    test('Unlock single tile', async () => {
      const linesAsync = createStreamFromString(example1)
      const maze = await LockedMazeRunner.parse(linesAsync, mazeValidChars, mazeLockChars, mazeKeyChars);
      maze.linkTiles();

      let shortestDistance = maze.shortestDistance('@', 'b');
      expect(shortestDistance).toEqual(-1);

      maze.unlockTile('A')

      shortestDistance = maze.shortestDistance('@', 'b');
      expect(shortestDistance).toEqual(4);
    })

    test('Unlock doors', async () => {
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
  })

})
