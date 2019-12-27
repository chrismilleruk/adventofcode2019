const { MazeRunner } = require('../lib/mazeRunner')
const { createStreamFromString } = require('../lib/createStream')

describe('Maze With Keys', () => {
  const mazeLockChars = 'ABCDEFG';
  const mazeKeyChars = 'abcdefg';
  const mazeValidChars = '.@' + mazeKeyChars;
  const mazeFreeRunChars = '.@' + mazeKeyChars + mazeLockChars;

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

    test('Check locked maze', async () => {
      const linesAsync = createStreamFromString(example1)
      const mazeLocked = await MazeRunner.parse(linesAsync, mazeValidChars);

      mazeLocked.linkTiles();
      let shortestDistance;

      shortestDistance = mazeLocked.shortestDistance('@', 'b');
      expect(shortestDistance).toEqual(-1);
    })

    test('Check freerun maze', async () => {
      const linesAsync = createStreamFromString(example1)
      const mazeFreerun = await MazeRunner.parse(linesAsync, mazeFreeRunChars);

      mazeFreerun.linkTiles();
      let shortestDistance;

      shortestDistance = mazeFreerun.shortestDistance('@', 'b');
      expect(shortestDistance).toEqual(4);
    })

    test('Shortest Routes (locked)', async () => {
      const linesAsync = createStreamFromString(example1)
      const mazeLocked = await MazeRunner.parse(linesAsync, mazeValidChars);

      mazeLocked.linkTiles();

      let shortestRoutes = mazeLocked.shortestRoutes('@', 'b');
      expect(shortestRoutes).toEqual([]);
    })

    test('Shortest Routes (freerun)', async () => {
      const linesAsync = createStreamFromString(example1)
      const mazeFreerun = await MazeRunner.parse(linesAsync, mazeFreeRunChars);

      mazeFreerun.linkTiles();
      let shortestRoutes = mazeFreerun.shortestRoutes('@', 'b');
      expect(shortestRoutes).toEqual([
        ['@', '4,1', 'A', '2,1', 'b']
      ]);
    })

    test('Check locked & freerun maze', async () => {
      const linesAsync1 = createStreamFromString(example1)
      const linesAsync2 = createStreamFromString(example1)
      const mazeLocked = await MazeRunner.parse(linesAsync1, mazeValidChars);
      const mazeFreerun = await MazeRunner.parse(linesAsync2, mazeFreeRunChars);

      mazeLocked.linkTiles();
      mazeFreerun.linkTiles();
      let shortestDistance;
      let shortestRoutes;

      shortestDistance = mazeLocked.shortestDistance('@', 'b');
      expect(shortestDistance).toEqual(-1);
      shortestRoutes = mazeLocked.shortestRoutes('@', 'b');
      expect(shortestRoutes).toEqual([]);

      shortestDistance = mazeFreerun.shortestDistance('@', 'b');
      expect(shortestDistance).toEqual(4);
      shortestRoutes = mazeFreerun.shortestRoutes('@', 'b');
      expect(shortestRoutes).toEqual([
        ['@', '4,1', 'A', '2,1', 'b']
      ]);
    })

    test('Unlock doors', async () => {
      const linesAsync1 = createStreamFromString(example1)
      const linesAsync2 = createStreamFromString(example1)
      const mazeLocked = await MazeRunner.parse(linesAsync1, mazeValidChars);
      const mazeFreerun = await MazeRunner.parse(linesAsync2, mazeFreeRunChars);

      mazeLocked.linkTiles();
      mazeFreerun.linkTiles();

      let shortestRoutes = mazeFreerun.shortestRoutes('@', 'b');
      let doors = shortestRoutes[0].filter(id => mazeLockChars.indexOf(id) > -1);
      let keys = doors.map(door => mazeLockChars.indexOf(door)).map(idx => mazeKeyChars[idx]);

      expect(doors).toEqual(['A']);
      expect(keys).toEqual(['a']);

      // For example, suppose you have the following map:
      // #########
      // #b.A.@.a#
      // #########
      expect(mazeLocked.shortestDistance('@', 'b')).toEqual(-1)
      expect(mazeLocked.shortestDistance('@', 'a')).toEqual(2)
      expect(mazeLocked.shortestDistance('a', 'b')).toEqual(-1)

      // Freerun ignores doors so looks like this:
      // #########
      // #b...@.a#
      // #########
      expect(mazeFreerun.shortestDistance('@', 'b')).toEqual(4)
      expect(mazeFreerun.shortestDistance('@', 'a')).toEqual(2)
      expect(mazeFreerun.shortestDistance('a', 'b')).toEqual(6)

      // unlock
      let doorTile = mazeFreerun.get('A');
      mazeLocked.addTile(doorTile.clone());

      // A is unlocked so should look like this:
      // #########
      // #b...@.a#
      // #########
      expect(mazeLocked.shortestDistance('@', 'b')).toEqual(4)
      expect(mazeLocked.shortestDistance('@', 'a')).toEqual(2)
      expect(mazeLocked.shortestDistance('a', 'b')).toEqual(6)
    })

  })

})
