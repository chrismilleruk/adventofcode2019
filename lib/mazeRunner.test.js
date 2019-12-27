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
  })
})
