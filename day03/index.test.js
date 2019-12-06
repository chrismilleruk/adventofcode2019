const {
  findClosestIntersection,
  findShortestIntersection,
  findIntersections,
  generatePositions,
  createStreamFromString,
  createStreamFromFile
} = require('./');

describe('Day 3: Crossed Wires', () => {
  describe('generatePositions', () => {
    function gen(pos, instr) {
      return Array.from(generatePositions(pos, instr));
    }

    test('U1', () => {
      let arr = gen({ x: 10, y: 10 }, 'U1');
      expect(arr).toEqual([
        { x: 11, y: 10 },
      ]);
    });

    test('U3', () => {
      let arr = gen(
        { x: 10, y: 10 }, 'U3');
      expect(arr).toEqual([
        { x: 11, y: 10 },
        { x: 12, y: 10 },
        { x: 13, y: 10 },
      ]);
    });

    test('D3', () => {
      let arr = gen(
        { x: 10, y: 10 }, 'D3');
      expect(arr).toEqual([
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 },
      ]);
    });

    test('R3', () => {
      let arr = gen(
        { x: 10, y: 10 }, 'R3');
      expect(arr).toEqual([
        { x: 10, y: 11 },
        { x: 10, y: 12 },
        { x: 10, y: 13 },
      ]);
    });

    test('L3', () => {
      let arr = gen(
        { x: 10, y: 10 }, 'L3');
      expect(arr).toEqual([
        { x: 10, y: 9 },
        { x: 10, y: 8 },
        { x: 10, y: 7 },
      ]);
    });

    test('R55', () => {
      let arr = gen(
        { x: 0, y: 0 }, 'R55');
      expect(arr.length).toBe(55);
    });
  });

  describe('examples', () => {
    // R8,U5,L5,D3,
    // U7,R6,D4,L4, = distance 6
    test('example 1, 2 intersections', async () => {
      let input = `R8,U5,L5,D3,
                    U7,R6,D4,L4`;
      let inputStream = createStreamFromString(input);
      let result = await findIntersections(inputStream);
      expect(result.length).toBe(2);
      expect(result).toMatchObject([
        { x: 5, y: 6 },
        { x: 3, y: 3 }
      ])
    });

    test('example 1, distance 6', async () => {
      let input = `R8,U5,L5,D3,
                    U7,R6,D4,L4`;
      let inputStream = createStreamFromString(input);
      let result = await findClosestIntersection(inputStream);
      expect(result).toBe(6);
    });

    // R75,D30,R83,U83,L12,D49,R71,U7,L72
    // U62,R66,U55,R34,D71,R55,D58,R83 = distance 159
    test('example 2, distance 159', async () => {
      let input = `R75,D30,R83,U83,L12,D49,R71,U7,L72
                    U62,R66,U55,R34,D71,R55,D58,R83`;
      let inputStream = createStreamFromString(input);
      let result = await findClosestIntersection(inputStream);
      expect(result).toBe(159);
    });

    // R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51
    // U98,R91,D20,R16,D67,R40,U7,R15,U6,R7 = distance 135
    test('example 3, distance 135', async () => {
      let input = `R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51
                    U98,R91,D20,R16,D67,R40,U7,R15,U6,R7`;
      let inputStream = createStreamFromString(input);
      let result = await findClosestIntersection(inputStream);
      expect(result).toBe(135);
    });

    // In the above example, the intersection closest to the central port 
    // is reached after 8+5+5+2 = 20 steps by the first wire and 7+6+4+3 = 20 
    // steps by the second wire for a total of 20+20 = 40 steps.
    // However, the top-right intersection is better: the first wire takes 
    // only 8+5+2 = 15 and the second wire takes only 7+6+2 = 15, a total 
    // of 15+15 = 30 steps.
    test('example 1, with steps', async () => {
      let input = `R8,U5,L5,D3,
                    U7,R6,D4,L4`;
      let inputStream = createStreamFromString(input);
      let result = await findIntersections(inputStream);
      expect(result.length).toBe(2);
      expect(result).toEqual([
        { w1: 15, w2: 15, x: 5, y: 6 },
        { w1: 20, w2: 20, x: 3, y: 3 }
      ])
    });

    test('example 1, shortest steps 30', async () => {
      let input = `R8,U5,L5,D3,
                    U7,R6,D4,L4`;
      let inputStream = createStreamFromString(input);
      let result = await findShortestIntersection(inputStream);
      expect(result).toBe(30);
    });

    // R75,D30,R83,U83,L12,D49,R71,U7,L72
    // U62,R66,U55,R34,D71,R55,D58,R83 = 610 steps
    test('example 2, shortest steps 610', async () => {
      let input = `R75,D30,R83,U83,L12,D49,R71,U7,L72
                    U62,R66,U55,R34,D71,R55,D58,R83`;
      let inputStream = createStreamFromString(input);
      let result = await findShortestIntersection(inputStream);
      expect(result).toBe(610);
    });

    // R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51
    // U98,R91,D20,R16,D67,R40,U7,R15,U6,R7 = 410 steps
    test('example 3, shortest steps 410', async () => {
      let input = `R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51
                    U98,R91,D20,R16,D67,R40,U7,R15,U6,R7`;
      let inputStream = createStreamFromString(input);
      let result = await findShortestIntersection(inputStream);
      expect(result).toBe(410);
    });
  });

  describe('input file', () => {
    const filename = __dirname + '/input.txt';

    test('check first 5 values', async () => {
      expect.assertions(1);

      let inputStream = createStreamFromFile(filename);
      let inputValues = [];
      for await (let val of inputStream) {
        inputValues.push(val);
        if (inputValues.length >= 5) break;
      }

      expect(inputValues).toStrictEqual([
        "R1004", "U520", "R137", "D262", "L403"
      ]);
    });

    test('count lines, check last 5 values', async () => {
      expect.assertions(1);

      let inputStream = createStreamFromFile(filename);
      let numLines = 0;
      let inputValues = [];
      for await (let val of inputStream) {
        // count EOL tokens
        if (val === "EOL") {
          numLines += 1;
          continue;
        }

        // populate array with last 5 elements.
        inputValues.push(val);
        if (inputValues.length > 5) inputValues.shift();
      }

      expect(inputValues).toStrictEqual([
        "R381", "U54", "L847", "U231", "L590"
      ]);
    });

    test('What is the Manhattan distance from the central port to the closest intersection?', async () => {
      expect.assertions(1);

      let inputStream = createStreamFromFile(filename);
      let result = await findClosestIntersection(inputStream);

      expect(result).toBe(207);
    });

    test('What is the fewest combined steps the wires must take to reach an intersection?', async () => {
      expect.assertions(1);

      let inputStream = createStreamFromFile(filename);
      let result = await findShortestIntersection(inputStream);

      expect(result).toBe(21196);
    });

  });

});
