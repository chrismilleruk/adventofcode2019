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
        ['a', '1,2', 'd', '2,3', '3,3', 'e', '5,3', '6,3', '7,3', 'h', 'f'],
        ['a', '2,1', '3,1', '3,2', '3,3', 'e', '5,3', '6,3', '7,3', 'h', 'f']
      ]);
    })
  })

  describe('Dynamic maze - Add Tiles', () => {
    const mazeValidChars = '.@ab';
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
      maze.addTile(tile.x - 2, tile.y, 'A');

      // A is added so maze now looks like this:
      // #########
      // #b...@.a#
      // #########
      expect(maze.shortestDistance('@', 'b')).toEqual(4)
      expect(maze.shortestDistance('@', 'a')).toEqual(2)
      expect(maze.shortestDistance('a', 'b')).toEqual(6)
    })
  })
})
