const { RepairDroid, Direction, Content, runRepairDroid } = require('./repairDroid');
const { loadIntcodeFile } = require('../lib/loadIntcode');
const filename = __dirname + '/input.txt';

describe('Repair Droid', () => {
  describe('Directions', () => {
    test('Rotate Left', () => {
      const droid = new RepairDroid();
      expect(droid.direction).toBe(Direction.North);
      droid.rotateLeft();
      expect(droid.direction).toBe(Direction.West);
      droid.rotateLeft();
      expect(droid.direction).toBe(Direction.South);
      droid.rotateLeft();
      expect(droid.direction).toBe(Direction.East);
      droid.rotateLeft();
      expect(droid.direction).toBe(Direction.North);
    });
    test('Rotate Right', () => {
      const droid = new RepairDroid();
      expect(droid.direction).toBe(Direction.North);
      droid.rotateRight();
      expect(droid.direction).toBe(Direction.East);
      droid.rotateRight();
      expect(droid.direction).toBe(Direction.South);
      droid.rotateRight();
      expect(droid.direction).toBe(Direction.West);
      droid.rotateRight();
      expect(droid.direction).toBe(Direction.North);
    })
    test('Set Direction', () => {
      const droid = new RepairDroid();
      expect(droid.direction).toBe(Direction.North);
      droid.direction = Direction.South;
      expect(droid.direction).toBe(Direction.South);
      droid.direction = Direction.North;
      expect(droid.direction).toBe(Direction.North);
      droid.direction = Direction.East;
      expect(droid.direction).toBe(Direction.East);
      droid.direction = Direction.West;
      expect(droid.direction).toBe(Direction.West);
      expect(() => droid.direction = 5).toThrowError('Unknown direction');
      expect(droid.directions.length).toBe(4);
    })
  })
  describe('Movement', () => {
    test('Move to Empty Space', () => {
      const droid = new RepairDroid();

      expect(droid.pos).toEqual([0, 0]);
      droid.move(Direction.North, Content.Empty);
      expect(droid.pos).toEqual([0, -1]);
      droid.move(Direction.East, Content.Empty)
      expect(droid.pos).toEqual([1, -1]);
      droid.move(Direction.East, Content.Empty)
      expect(droid.pos).toEqual([2, -1]);
      droid.move(Direction.South, Content.Empty)
      expect(droid.pos).toEqual([2, 0]);
      droid.move(Direction.South, Content.Empty)
      expect(droid.pos).toEqual([2, 1]);
      droid.move(Direction.West, Content.Empty)
      expect(droid.pos).toEqual([1, 1]);
      droid.move(Direction.West, Content.Empty)
      expect(droid.pos).toEqual([0, 1]);
      droid.move(Direction.West, Content.Empty)
      expect(droid.pos).toEqual([-1, 1]);
    })
    test('Move with Walls', () => {
      const droid = new RepairDroid();

      //  ###
      //  x.#
      // #..#
      //  ###
      expect(droid.pos).toEqual([0, 0]);
      droid.move(Direction.North, Content.Wall);
      // (we don't move if it's a wall)
      expect(droid.pos).toEqual([0, 0]);
      droid.move(Direction.East, Content.Empty)
      expect(droid.pos).toEqual([1, 0]);
      droid.move(Direction.East, Content.Wall)
      // (we don't move if it's a wall)
      expect(droid.pos).toEqual([1, 0]);
      droid.move(Direction.South, Content.Empty)
      expect(droid.pos).toEqual([1, 1]);
      droid.move(Direction.South, Content.Wall)
      // (we don't move if it's a wall)
      expect(droid.pos).toEqual([1, 1]);
      droid.move(Direction.West, Content.Empty)
      expect(droid.pos).toEqual([0, 1]);
      droid.move(Direction.West, Content.Wall)
      // (we don't move if it's a wall)
      expect(droid.pos).toEqual([0, 1]);
      droid.move(Direction.North, Content.Empty)
      expect(droid.pos).toEqual([0, 0]);

      //  #
      //  x.#
      // #..
      //   #
      expect(droid.map.get('0,0').content).toEqual(Content.Empty);
      expect(droid.map.get('1,0').content).toEqual(Content.Empty);
      expect(droid.map.get('1,1').content).toEqual(Content.Empty);
      expect(droid.map.get('0,1').content).toEqual(Content.Empty);
      
      expect(droid.map.get('0,-1').content).toEqual(Content.Wall);
      expect(droid.map.get('2,0').content).toEqual(Content.Wall);
      expect(droid.map.get('1,2').content).toEqual(Content.Wall);
      expect(droid.map.get('-1,1').content).toEqual(Content.Wall);

    });
    test('Peek behaviour', () => {
      const droid = new RepairDroid();

      // 0,-1 - #
      // 0, 0 - x
      // 0, 1 - .
      // 0, 2 - .
      expect(droid.pos).toEqual([0, 0]);
      expect(droid.peek(Direction.North)).toBe(Content.Unknown);
      expect(droid.peek(Direction.South)).toBe(Content.Unknown);

      droid.move(Direction.North, Content.Wall);

      expect(droid.pos).toEqual([0, 0]);
      expect(droid.peek(Direction.North)).toBe(Content.Wall);
      expect(droid.peek(Direction.South)).toBe(Content.Unknown);

      droid.move(Direction.South, Content.Empty);
      droid.move(Direction.North, Content.Empty);

      expect(droid.pos).toEqual([0, 0]);
      expect(droid.peek(Direction.North)).toBe(Content.Wall);
      expect(droid.peek(Direction.South)).toBe(Content.Empty);

    })
  })
  describe('Seek', () => {
    function seekUsingList(contentList) {
      const droid = new RepairDroid();

      let moves = [];
      for (const direction of droid) {
        const content = contentList.shift();

        if (typeof content === 'undefined') break;

        const move = [direction, content];
        moves.push(move);
        droid.move(move[0], move[1]);

        if (content === Content.OxygenSystem) break;
      }

      return { droid, moves };
    }

    function seekUsingGrid(gridLines) {
      if (gridLines.indexOf('x') === -1) {
        throw `No 'x' found to signify start pos.`
      }
      if (gridLines.indexOf('*') === -1) {
        throw `No '*' found to signify oxygen.`
      }
      const grid = gridLines.split('\n').map(line => line.trim());
      let pos = { x: 0, y: 0 };
      
      grid.find((line, y) => {
        const x = line.indexOf('x');
        if (x > -1) {
          pos = {x, y};
          return true;
        }
      })

      const droid = new RepairDroid();

      let moves = [];
      for (const direction of droid) {
        let newPos = getPos(direction);
        let content = checkPos(newPos.x, newPos.y);

        const move = [direction, content];
        moves.push(move);
        droid.move(move[0], move[1]);
        
        if (content !== Content.Wall) {
          pos = newPos;
        }

        if (content === Content.OxygenSystem) break;
      }

      return { droid, moves };

      function getPos(direction) {
        let newPos = {...pos};
        switch (direction) {
          case Direction.North:
            newPos.y -= 1;
            break;
          case Direction.South:
            newPos.y += 1;
            break;
          case Direction.West:
            newPos.x -= 1;
            break;
          case Direction.East:
            newPos.x += 1;
            break;
        }
        return newPos;
      }

      function checkPos(x, y) {
        let char = grid[y][x];
        switch (char) {
          case ' ':
            return Content.Unknown;
          case '.':
            return Content.Empty;
          case 'x':
            return Content.Empty;
          case '#':
            return Content.Wall;
          case '*':
            return Content.OxygenSystem;
          default:
            return Content.Unknown;
        }
      }
    }

    test('Seek stops when finding Oxygen System', () => {
      const { moves } = seekUsingList([
        Content.Empty, 
        Content.Empty, 
        Content.Empty, 
        Content.OxygenSystem,
        Content.Empty, 
        Content.Empty, 
      ])
      expect(moves.length).toEqual(4)
    })

    test('Seek right when meeting a wall', () => {
      const { moves } = seekUsingList([
        Content.Wall, 
        Content.Empty, 
        Content.Wall, 
        Content.Empty, 
        Content.Wall, 
        Content.Empty, 
        Content.OxygenSystem
      ])
      expect(moves).toEqual([
        [Direction.North, Content.Wall], 
        [Direction.East, Content.Empty], 
        [Direction.North, Content.Wall], 
        [Direction.East, Content.Empty], 
        [Direction.North, Content.Wall], 
        [Direction.East, Content.Empty], 
        [Direction.North, Content.OxygenSystem]
      ])
    })

    test('Return from dead end corridoor', () => {
      const { moves, droid } = seekUsingGrid(`
      ............
      .########...
      .#*x....#...
      .########...
      ............
      `);
      expect(droid.pos).toEqual([-1, 0])
    })

    test('Seek right and around a box', () => {
      const { moves, droid } = seekUsingGrid(`
      .......
      .####..
      .#x.#..
      *...#..
      .####..
      `);

      expect(droid.pos).toEqual([-2, 1])
    })
    test('Seek left and around a box', () => {
      const { moves, droid } = seekUsingGrid(`
      .......
      .####..
      .#.x#..
      .#...*.
      .####..
      `);

      expect(droid.pos).toEqual([2, 1])
    })
    test('Seek left and around a chicane', () => {
      const { moves, droid } = seekUsingGrid(`
      ...........
      .##########
      .#.x#.....#
      .#.....#*.#
      .##########
      `);

      expect(droid.pos).toEqual([5, 1])
    })
  })

  describe('Run intcode', () => {
    test.skip('program', async () => {
      const program = await loadIntcodeFile(filename);
      const droid = new RepairDroid();
      for await (const evt of runRepairDroid(program, droid, 10000)) {
        // nothing here.
      }

      expect(droid.pos).toEqual([16, 18]);
      expect(droid.oxygenSystem).toMatchObject({ distance: 294 });
    })
  })
})
