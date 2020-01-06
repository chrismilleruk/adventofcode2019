const { MazeRunner } = require('../lib/mazeRunner')
const { TeleportMazeRunner } = require('./teleportMazeRunner')
const { createStreamFromString, createStreamFromFile } = require('../lib/createStream')

const filename = __dirname + '/input.txt';

describe('Maze With Portals', () => {
  const mazeKeyChars = 'abcdefgz';
  const mazeLabelChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const mazeValidChars = '.@';// + mazeKeyChars;

  describe('Day 20, example 1, basic mechanics with MazeRunner', () => {
    //          A           
    //          A           
    //   #######.#########  
    //   #######.........#  
    //   #######.#######.#  
    //   #######.#######.#  
    //   #######.#######.#  
    //   #####  B    ###.#  
    // BC...##  C    ###.#  
    //   ##.##       ###.#  
    //   ##...DE  F  ###.#  
    //   #####    G  ###.#  
    //   #########.#####.#  
    // DE..#######...###.#  
    //   #.#########.###.#  
    // FG..#########.....#  
    //   ###########.#####  
    //              Z       
    //              Z       

    const example1 = `
         A           
         A           
  #######.#########  
  #######.........#  
  #######.#######.#  
  #######.#######.#  
  #######.#######.#  
  #####  B    ###.#  
BC...##  C    ###.#  
  ##.##       ###.#  
  ##...DE  F  ###.#  
  #####    G  ###.#  
  #########.#####.#  
DE..#######...###.#  
  #.#########.###.#  
FG..#########.....#  
  ###########.#####  
             Z       
             Z       
    `;

    test('MazeRunner, Manual teleport & run maze', async () => {
      const linesAsync = createStreamFromString(example1, false)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars);

      // AA = 9,2
      maze.get('9,2').id = 'AA';

      // BC = 9,6 -> 2,8
      maze.get('9,6').id = 'BC1';
      maze.get('2,8').id = 'BC2';

      // DE = 6,10 -> 2,13
      maze.get('6,10').id = 'DE1';
      maze.get('2,13').id = 'DE2';

      // FG = 11,12 -> 2,15
      maze.get('11,12').id = 'FG1';
      maze.get('2,15').id = 'FG2';

      // ZZ = 13,16
      maze.get('13,16').id = 'ZZ';

      maze.linkTiles();

      let shortestDistance;
      let shortestRoutes;

      // One path through the maze doesn't require any portals. Starting at AA, you could go down 1, right 8, down 12, left 4, and down 1 to reach ZZ, a total of 26 steps.
      shortestDistance = maze.shortestDistance('AA', 'ZZ');
      expect(shortestDistance).toEqual(26);

      // Create the teleport links
      maze.addLink('BC1', 'BC2', 'BC');
      maze.addLink('DE1', 'DE2', 'DE');
      maze.addLink('FG1', 'FG2', 'FG');

      // Clear the maze cache because the maze shape has changed.
      maze.cacheClear()

      // However, there is a shorter path: 
      shortestRoutes = maze.shortestRoutes('AA', 'ZZ');
      shortestDistance = maze.shortestDistance('AA', 'ZZ');

      // You could walk from AA to the inner BC portal (4 steps), 
      // warp to the outer BC portal (1 step), 
      // walk to the inner DE (6 steps), 
      // warp to the outer DE (1 step), 
      // walk to the outer FG (4 steps), 
      // warp to the inner FG (1 step), 
      // and finally walk to ZZ (6 steps). 
      expect(shortestRoutes).toEqual([
        ['AA',
          '9,3', '9,4', '9,5', 'BC1', 'BC2',
          '3,8', '4,8', '4,9', '4,10', '5,10', 'DE1', 'DE2',
          '3,13', '3,14', '3,15', 'FG2', 'FG1',
          '11,13', '12,13', '13,13', '13,14', '13,15', 'ZZ']
      ])

      // In total, this is only 23 steps.
      expect(shortestDistance).toEqual(23);
    })

    test('MazeRunner, Extract Teleport IDs manually', async () => {
      const linesAsync = createStreamFromString(example1, false)
      const maze = await MazeRunner.parse(linesAsync, mazeValidChars, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');

      const specialTiles = new Map(maze.specialTiles.map(tile => [tile.key, tile]));
      const links = new Map();

      for (const tile1 of specialTiles.values()) {
        let searchKey1 = String([tile1.x, tile1.y + 1]);
        let searchKey2 = String([tile1.x + 1, tile1.y]);
        let tile2;
        let linkName;

        if (specialTiles.has(searchKey1)) {
          tile2 = specialTiles.get(searchKey1);
          linkName = tile1.char + tile2.char;

          searchKey1 = String([tile1.x, tile1.y - 1])
          searchKey2 = String([tile1.x, tile1.y + 2])
        }
        if (specialTiles.has(searchKey2)) {
          tile2 = specialTiles.get(searchKey2);
          linkName = tile1.char + tile2.char;

          searchKey1 = String([tile1.x - 1, tile1.y])
          searchKey2 = String([tile1.x + 2, tile1.y])
        }

        if (!linkName) continue;

        const mazeTile = maze.get(searchKey1) || maze.get(searchKey2);

        if (!links.has(linkName)) links.set(linkName, []);
        links.get(linkName).push(mazeTile);
      }

      for (const [linkName, tiles] of links) {
        if (tiles.length === 1) {
          tiles[0].id = linkName;
          continue;
        }

        tiles.forEach((tile, idx) => {
          let name = linkName + (idx + 1);
          tile.id = name;
        })
      }

      // AA = 9,2
      expect(maze.get('9,2')).toHaveProperty('id', 'AA')

      // ZZ = 13,16
      expect(maze.get('13,16')).toHaveProperty('id', 'ZZ');

      // BC = 9,6 -> 2,8
      expect(maze.get('9,6')).toHaveProperty('id', 'BC1');
      expect(maze.get('2,8')).toHaveProperty('id', 'BC2');

      // DE = 6,10 -> 2,13
      expect(maze.get('6,10')).toHaveProperty('id', 'DE1');
      expect(maze.get('2,13')).toHaveProperty('id', 'DE2');

      // FG = 11,12 -> 2,15
      expect(maze.get('11,12')).toHaveProperty('id', 'FG1');
      expect(maze.get('2,15')).toHaveProperty('id', 'FG2');
    })

    test('TeleportMazeRunner, Check Teleport IDs assigned', async () => {
      const linesAsync = createStreamFromString(example1, false)
      const maze = await TeleportMazeRunner.parse(linesAsync, mazeValidChars, mazeLabelChars);

      // AA = 9,2
      expect(maze.get('9,2')).toHaveProperty('id', 'AA')

      // ZZ = 13,16
      expect(maze.get('13,16')).toHaveProperty('id', 'ZZ');

      // BC = 9,6 -> 2,8
      expect(maze.get('9,6')).toHaveProperty('id', 'BC1');
      expect(maze.get('2,8')).toHaveProperty('id', 'BC0');

      // DE = 6,10 -> 2,13
      expect(maze.get('6,10')).toHaveProperty('id', 'DE1');
      expect(maze.get('2,13')).toHaveProperty('id', 'DE0');

      // FG = 11,12 -> 2,15
      expect(maze.get('11,12')).toHaveProperty('id', 'FG1');
      expect(maze.get('2,15')).toHaveProperty('id', 'FG0');
    })

    test('TeleportMazeRunner, Run Maze', async () => {
      const linesAsync = createStreamFromString(example1, false)
      const maze = await TeleportMazeRunner.parse(linesAsync, mazeValidChars, mazeLabelChars);

      maze.linkTiles();

      let shortestDistance;
      let shortestRoutes;

      // However, there is a shorter path: 
      shortestRoutes = maze.shortestRoutes('AA', 'ZZ');
      shortestDistance = maze.shortestDistance('AA', 'ZZ');

      // You could walk from AA to the inner BC portal (4 steps), 
      // warp to the outer BC portal (1 step), 
      // walk to the inner DE (6 steps), 
      // warp to the outer DE (1 step), 
      // walk to the outer FG (4 steps), 
      // warp to the inner FG (1 step), 
      // and finally walk to ZZ (6 steps). 
      expect(shortestRoutes).toEqual([
        ['AA',
          '9,3', '9,4', '9,5', 'BC1', 'BC0',
          '3,8', '4,8', '4,9', '4,10', '5,10', 'DE1', 'DE0',
          '3,13', '3,14', '3,15', 'FG0', 'FG1',
          '11,13', '12,13', '13,13', '13,14', '13,15', 'ZZ']
      ])

      // In total, this is only 23 steps.
      expect(shortestDistance).toEqual(23);
    })
  })

  describe('Day 20, Example 2', () => {
    const example2 = `
                       A               
                       A               
      #################.#############  
      #.#...#...................#.#.#  
      #.#.#.###.###.###.#########.#.#  
      #.#.#.......#...#.....#.#.#...#  
      #.#########.###.#####.#.#.###.#  
      #.............#.#.....#.......#  
      ###.###########.###.#####.#.#.#  
      #.....#        A   C    #.#.#.#  
      #######        S   P    #####.#  
      #.#...#                 #......VT
      #.#.#.#                 #.#####  
      #...#.#               YN....#.#  
      #.###.#                 #####.#  
    DI....#.#                 #.....#  
      #####.#                 #.###.#  
    ZZ......#               QG....#..AS
      ###.###                 #######  
    JO..#.#.#                 #.....#  
      #.#.#.#                 ###.#.#  
      #...#..DI             BU....#..LF
      #####.#                 #.#####  
    YN......#               VT..#....QG
      #.###.#                 #.###.#  
      #.#...#                 #.....#  
      ###.###    J L     J    #.#.###  
      #.....#    O F     P    #.#...#  
      #.###.#####.#.#####.#####.###.#  
      #...#.#.#...#.....#.....#.#...#  
      #.#####.###.###.#.#.#########.#  
      #...#.#.....#...#.#.#.#.....#.#  
      #.###.#####.###.###.#.#.#######  
      #.#.........#...#.............#  
      #########.###.###.#############  
               B   J   C               
               U   P   P               
              `;

    test('AA to ZZ takes 58 steps.', async () => {
      const linesAsync = createStreamFromString(example2, false)
      const maze = await TeleportMazeRunner.parse(linesAsync, mazeValidChars, mazeLabelChars);

      maze.linkTiles();

      // Map { 'AA' => [ 
      // Tile { x: 23, y: 2, char: '.', links: [Object], _id: 'AA' } ],
      // 'AS' => [ 
      // Tile { x: 21, y: 8, char: '.', links: [Object], _id: 'AS1' },
      // Tile { x: 36, y: 17, char: '.', links: [Object], _id: 'AS2' } ],
      // 'CP' => [ 
      // Tile { x: 25, y: 8, char: '.', links: [Object], _id: 'CP1' },
      // Tile { x: 23, y: 34, char: '.', links: [Object], _id: 'CP2' } ],
      // 'VT' => [ 
      // Tile { x: 36, y: 11, char: '.', links: [Object], _id: 'VT1' },
      // Tile { x: 30, y: 23, char: '.', links: [Object], _id: 'VT2' } ],
      // 'YN' => [ 
      // Tile { x: 30, y: 13, char: '.', links: [Object], _id: 'YN1' },
      // Tile { x: 6, y: 23, char: '.', links: [Object], _id: 'YN2' } ],
      // 'DI' => [ 
      // Tile { x: 6, y: 15, char: '.', links: [Object], _id: 'DI1' },
      // Tile { x: 12, y: 21, char: '.', links: [Object], _id: 'DI2' } ],
      // 'ZZ' => [ 
      // Tile { x: 6, y: 17, char: '.', links: [Object], _id: 'ZZ' } ],
      // 'QG' => [ 
      // Tile { x: 30, y: 17, char: '.', links: [Object], _id: 'QG1' },
      // Tile { x: 36, y: 23, char: '.', links: [Object], _id: 'QG2' } ],
      // 'JO' => [ 
      // Tile { x: 6, y: 19, char: '.', links: [Object], _id: 'JO1' },
      // Tile { x: 17, y: 28, char: '.', links: [Object], _id: 'JO2' } ],
      // 'BU' => [ 
      // Tile { x: 30, y: 21, char: '.', links: [Object], _id: 'BU1' },
      // Tile { x: 15, y: 34, char: '.', links: [Object], _id: 'BU2' } ],
      // 'LF' => [ 
      // Tile { x: 36, y: 21, char: '.', links: [Object], _id: 'LF1' },
      // Tile { x: 19, y: 28, char: '.', links: [Object], _id: 'LF2' } ],
      // 'JP' => [ 
      // Tile { x: 25, y: 28, char: '.', links: [Object], _id: 'JP1' },
      // Tile { x: 19, y: 34, char: '.', links: [Object], _id: 'JP2' } ] }

      expect(maze.shortestDistance('AS0', 'AS1')).toBe(1);
      expect(maze.shortestDistance('QG0', 'QG1')).toBe(1);
      expect(maze.shortestDistance('BU0', 'BU1')).toBe(1);
      expect(maze.shortestDistance('JO0', 'JO1')).toBe(1);
      
      expect(maze.shortestDistance('AA', 'AS1')).toBe(12);
      expect(maze.shortestDistance('AA', 'QG1')).toBe(23);
      expect(maze.shortestDistance('AA', 'BU1')).toBe(36);
      expect(maze.shortestDistance('AA', 'JO1')).toBe(45);

      // Here, AA has no direct path to ZZ, but it does connect to AS and CP. 

      // By passing through AS, QG, BU, and JO, you can reach ZZ in 58 steps.
      let shortestRoutes = maze.shortestRoutes('AA', 'ZZ');
      let shortestDistance = maze.shortestDistance('AA', 'ZZ');

      expect(shortestDistance).toEqual(58);

      expect(shortestRoutes).toHaveLength(1);
      expect(shortestRoutes[0]).toContain('AS0');
      expect(shortestRoutes[0]).toContain('QG0');
      expect(shortestRoutes[0]).toContain('BU0');
      expect(shortestRoutes[0]).toContain('JO0');
    })

    // In your maze, how many steps does it take to get from the open tile 
    // marked AA to the open tile marked ZZ?

  })

  describe('Day 20, Puzzle Input', () => {

    test('AA to ZZ takes 442 steps.', async () => {
      const linesAsync = createStreamFromFile(filename, false)
      const maze = await TeleportMazeRunner.parse(linesAsync, mazeValidChars, mazeLabelChars);

      maze.linkTiles();

      // In your maze, how many steps does it take to get from the open tile 
      // marked AA to the open tile marked ZZ?
      let shortestDistance = maze.shortestDistance('AA', 'ZZ');

      // That's not the right answer; your answer is too high. (You guessed 452.)
      expect(shortestDistance).toBe(442);
    })
  })


  describe('Day 20, Part 2, Example 3', () => {
    const example3 = `
             Z L X W       C                 
             Z P Q B       K                 
  ###########.#.#.#.#######.###############  
  #...#.......#.#.......#.#.......#.#.#...#  
  ###.#.#.#.#.#.#.#.###.#.#.#######.#.#.###  
  #.#...#.#.#...#.#.#...#...#...#.#.......#  
  #.###.#######.###.###.#.###.###.#.#######  
  #...#.......#.#...#...#.............#...#  
  #.#########.#######.#.#######.#######.###  
  #...#.#    F       R I       Z    #.#.#.#  
  #.###.#    D       E C       H    #.#.#.#  
  #.#...#                           #...#.#  
  #.###.#                           #.###.#  
  #.#....OA                       WB..#.#..ZH
  #.###.#                           #.#.#.#  
CJ......#                           #.....#  
  #######                           #######  
  #.#....CK                         #......IC
  #.###.#                           #.###.#  
  #.....#                           #...#.#  
  ###.###                           #.#.#.#  
XF....#.#                         RF..#.#.#  
  #####.#                           #######  
  #......CJ                       NM..#...#  
  ###.#.#                           #.###.#  
RE....#.#                           #......RF
  ###.###        X   X       L      #.#.#.#  
  #.....#        F   Q       P      #.#.#.#  
  ###.###########.###.#######.#########.###  
  #.....#...#.....#.......#...#.....#.#...#  
  #####.#.###.#######.#######.###.###.#.#.#  
  #.......#.......#.#.#.#.#...#...#...#.#.#  
  #####.###.#####.#.#.#.#.###.###.#.###.###  
  #.......#.....#.#...#...............#...#  
  #############.#.#.###.###################  
               A O F   N                     
               A A D   M                     
    `;

    test('basic tests.', async () => {
      const linesAsync = createStreamFromString(example3, false)
      const maze = await TeleportMazeRunner.parse(linesAsync, mazeValidChars, mazeLabelChars);

      maze.linkTiles(TeleportMazeRunner.generateTeleportFns);

      // Outer is always (xx1), Inner is always (xx2)
      expect(maze.get('AA').key).toBe('15,34')  // Outer
      expect(maze.get('ZZ').key).toBe('13,2')   // Outer
      
      // Top row. x = 2
      expect(maze.get('WB0').key).toBe('19,2')  // Outer
      expect(maze.get('WB1').key).toBe('36,13')

      // Bottom row. y = 34
      expect(maze.get('FD0').key).toBe('19,34') // Outer
      expect(maze.get('FD1').key).toBe('13,8')

      // Left side. x = 2
      expect(maze.get('XF0').key).toBe('2,21')  // Outer
      expect(maze.get('XF1').key).toBe('17,28')

      // Right side. x = 42
      expect(maze.get('ZH0').key).toBe('42,13')  // Outer
      expect(maze.get('ZH1').key).toBe('31,8')

      // Inner(1) to Outer(0) will step down a level
      expect(maze.shortestDistance('WB1', 'WB0', 0, 1)).toBe(1);
      expect(maze.shortestDistance('WB1', 'WB0', '', 1)).toBe(1);
      expect(maze.shortestDistance('WB1', 'WB0', 1, 2)).toBe(1);

      expect(maze.shortestDistance('FD1', 'FD0', 0, 1)).toBe(1);

      // Outer(0) to Inner(1) will step up a level
      expect(maze.shortestDistance('FD0', 'FD1', 1, 0)).toBe(1);

      // FD2 directly connects to ZZ on same level.
      expect(maze.shortestDistance('FD1', 'ZZ', 0, 0)).toBe(18);

      // Traverse up a level.
      expect(maze.shortestDistance('FD0', 'ZZ', 1, 0)).toBe(19);
      expect(maze.shortestDistance('XQ0', 'FD0', 1, 0)).toBe(9);
      expect(maze.shortestDistance('XQ0', 'ZZ', 2, 0)).toBe(28);

      // expect(maze.shortestDistance('WB0', 'WB1')).toBe(1);
      // expect(maze.shortestDistance('XF0', 'XF1')).toBe(1);
      // expect(maze.shortestDistance('BU0', 'BU1')).toBe(1);
      // expect(maze.shortestDistance('JO0', 'JO1')).toBe(1);
      
      // expect(maze.shortestDistance('AA', 'AS1')).toBe(13);
      // expect(maze.shortestDistance('AA', 'QG1')).toBe(24);
      // expect(maze.shortestDistance('AA', 'BU1')).toBe(37);
      // expect(maze.shortestDistance('AA', 'JO1')).toBe(45);
    });

    test('396 steps to move from AA at the outermost layer to ZZ at the outermost layer.', async () => {
      const linesAsync = createStreamFromString(example3, false)
      const maze = await TeleportMazeRunner.parse(linesAsync, mazeValidChars, mazeLabelChars);

      maze.linkTiles(TeleportMazeRunner.generateTeleportFns);

      // This path takes a total of 396 steps to move from AA at the outermost layer to ZZ at the outermost layer.
      let shortestRoutes = maze.shortestRoutes('AA', 'ZZ', 0, 0);
      let shortestDistance = maze.shortestDistance('AA', 'ZZ', 0, 0);

      expect(shortestDistance).toEqual(396);

      expect(shortestRoutes).toHaveLength(1);
      // expect(shortestRoutes[0]).toContain('AS1');
    })
  })
})
