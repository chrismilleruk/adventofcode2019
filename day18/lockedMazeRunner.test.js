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
      const maze = await LockedMazeRunner.parse(linesAsync, mazeValidChars, mazeLockChars, mazeKeyChars);
      const lockedState = '';

      maze.linkTiles();

      let shortestDistance = maze.shortestDistance('@', 'b', lockedState);
      expect(shortestDistance).toEqual(-1);

      let shortestRoutes = maze.shortestRoutes('@', 'b', lockedState);
      expect(shortestRoutes).toEqual([]);
    })

    test('Unlocked maze *can* navigate from @ to b', async () => {
      const linesAsync = createStreamFromString(example1)
      const maze = await LockedMazeRunner.parse(linesAsync, mazeValidChars, mazeLockChars, mazeKeyChars);
      const unlockedState = maze.keyChars;

      maze.linkTiles();

      expect(maze.keyChars).toEqual('ab');
      expect(maze.lockChars).toEqual('A');

      let shortestDistance = maze.shortestDistance('@', 'b', unlockedState);
      expect(shortestDistance).toEqual(4);

      let shortestRoutes = maze.shortestRoutes('@', 'b', unlockedState);
      expect(shortestRoutes).toEqual([
        ['@', '4,1', 'A', '2,1', 'b']
      ]);

      maze.shortestDistance('@', 'b');
      expect(shortestDistance).toEqual(4);
    })

    test('Shortest Routes (locked and unlocked)', async () => {
      const linesAsync = createStreamFromString(example1)
      const maze = await LockedMazeRunner.parse(linesAsync, mazeValidChars, mazeLockChars, mazeKeyChars);
      const lockedState = '';
      const unlockedState = maze.keyChars;
      maze.linkTiles();

      let shortestRoutes;

      shortestRoutes = maze.shortestRoutes('@', 'b', lockedState);
      expect(shortestRoutes).toEqual([]);
      
      shortestRoutes = maze.shortestRoutes('@', 'b', unlockedState);
      expect(shortestRoutes).toEqual([
        ['@', '4,1', 'A', '2,1', 'b']
      ]);

      shortestRoutes = maze.shortestRoutes('@', 'b', lockedState, '*');
      expect(shortestRoutes).toEqual([
        [ '@', '6,1', 'a', '6,1', '@', '4,1', 'A', '2,1', 'b' ]
      ]);

      shortestRoutes = maze.shortestRoutes('@', 'b', lockedState, unlockedState);
      expect(shortestRoutes).toEqual([
        [ '@', '6,1', 'a', '6,1', '@', '4,1', 'A', '2,1', 'b' ]
      ]);
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

      let shortestDistance;

      shortestDistance = mazeLocked.shortestDistance('@', 'd', '', 'abcd');
      expect(shortestDistance).toEqual(42);

      shortestDistance = mazeLocked.shortestDistance('d', 'f', 'abcd', '*');
      expect(shortestDistance).toEqual(44);

      shortestDistance = mazeLocked.shortestDistance('@', 'f', '', '*');
      expect(shortestDistance).toEqual(86);

      // let shortestRoutes = mazeLocked.shortestRoutes('@', 'f', '', '*');
      // expect(shortestRoutes).toEqual([]);
    })
  })

  describe('Day 18, other examples', () => {
    function filterRoutes(shortestRoutes, filterChars) {
      return shortestRoutes.map(route => {
        return route.filter(pos => filterChars.indexOf(pos) > -1)
        .filter((v,i,self) => self.indexOf(v) === i)
      })
    }

    // Here are a few more examples:
    const example3 = `
    ########################
    #...............b.C.D.f#
    #.######################
    #.....@.a.B.c.d.A.e.F.g#
    ########################
    `;
    // Shortest path is 132 steps: b, a, c, d, f, e, g

    test('Ex3. Shortest path is 132 steps: b, a, c, d, f, e, g', async () => {
      const linesAsync = createStreamFromString(example3)
      const maze = await LockedMazeRunner.parse(linesAsync);

      maze.linkTiles();

      let shortestDistance = maze.shortestDistance('@', 'g', '', '*');
      expect(shortestDistance).toEqual(132);

      let shortestRoutes = maze.shortestRoutes('@', 'g', '', '*');
      shortestRoutes = filterRoutes(shortestRoutes, maze.keyChars);
      expect(shortestRoutes).toEqual([ 
        ['b', 'a', 'c', 'd', 'f', 'e', 'g']
      ]);
    })

    const example4 = `
    #################
    #i.G..c...e..H.p#
    ########.########
    #j.A..b...f..D.o#
    ########@########
    #k.E..a...g..B.n#
    ########.########
    #l.F..d...h..C.m#
    #################
    `;
    // Shortest paths are 136 steps;
    // one is: a, f, b, j, g, n, h, d, l, o, e, p, c, i, k, m

    test('Ex4. Shortest paths are 136 steps; one is: a, f, b, j, g, n, h, d, l, o, e, p, c, i, k, m', async () => {
      const linesAsync = createStreamFromString(example4)
      const maze = await LockedMazeRunner.parse(linesAsync);

      maze.linkTiles();

      let shortestDistance = maze.shortestDistance('@', 'm', '', maze.keyChars);
      expect(shortestDistance).toEqual(136);

      let shortestRoutes = maze.shortestRoutes('@', 'm', '', maze.keyChars);
      shortestRoutes = filterRoutes(shortestRoutes, maze.keyChars);
      expect(shortestRoutes).toHaveLength(400);
      expect(shortestRoutes).toEqual(
        expect.arrayContaining([['a', 'f', 'b', 'j', 'g', 'n', 'h', 'd', 'l', 'o', 'e', 'p', 'c', 'i', 'k', 'm']])
      )
    })

    const example5 = `
    ########################
    #@..............ac.GI.b#
    ###d#e#f################
    ###A#B#C################
    ###g#h#i################
    ########################
    `;
    // Shortest paths are 81 steps; one is: a, c, f, i, d, g, b, e, h

    test('Ex5. Shortest paths are 81 steps; one is: a, c, f, i, d, g, b, e, h', async () => {
      const linesAsync = createStreamFromString(example5)
      const maze = await LockedMazeRunner.parse(linesAsync);

      maze.linkTiles();

      let shortestDistance = maze.shortestDistance('@', 'h', '', maze.keyChars);
      expect(shortestDistance).toEqual(81);

      let shortestRoutes = maze.shortestRoutes('@', 'h', '', maze.keyChars);
      shortestRoutes = filterRoutes(shortestRoutes, maze.keyChars);
      expect(shortestRoutes).toEqual([
        [ 'a', 'c', 'd', 'g', 'f', 'i', 'b', 'e', 'h' ],
        [ 'a', 'c', 'f', 'i', 'd', 'g', 'b', 'e', 'h' ]
      ]);
    })
  })
})
