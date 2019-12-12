const { executeCommand, executeProgram, executeProgramAsGenerator } = require('./intCodeComputer');

describe('execute command', () => {
  test('Encountering an unknown opcode means something went wrong.', async () => {
    expect.assertions(1);
    try {
      await executeCommand([13], 0)
    } catch (e) {
      expect(e).toBe("unknown command 13 at pos 0");
    }
  });

  describe('opcode 1: add', () => {
    test('add 1,0,0,3 -> 1(add): pos[0]>(1) + pos[0]>(1) = (2)>pos[3]', async () => {
      expect.assertions(2);
      let buffer = [1, 0, 0, 3];
      let size = await executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([1, 0, 0, 2]);
    });

    test('add 1,4,5,6,99,1,0 -> 1(add): pos[4]>(99) + pos[5]>(1) = (100)>pos[6]', async () => {
      expect.assertions(2);
      let buffer = [1, 4, 5, 6, 99, 1, 0];
      let size = await executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([1, 4, 5, 6, 99, 1, 100]);
    });

    test('add 101,20,0,3 -> 1(add): imm(20) + pos[0]>(101) = (121)>pos[3]', async () => {
      expect.assertions(2);
      let buffer = [101, 20, 0, 3];
      let size = await executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([101, 20, 0, 121]);
    });

    test('add 101,4,5,6,99,1,0 -> 1(add): imm(4) + pos[5]>(1) = (5)>pos[6]', async () => {
      expect.assertions(2);
      let buffer = [101, 4, 5, 6, 99, 1, 0];
      let size = await executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([101, 4, 5, 6, 99, 1, 5]);
    });

    test('add 1001,4,5,6,99,1,0 -> 1(add): pos[4]>(99) + imm(5) = (104)>pos[6]', async () => {
      expect.assertions(2);
      let buffer = [1001, 4, 5, 6, 99, 1, 0];
      let size = await executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([1001, 4, 5, 6, 99, 1, 104]);
    });

    test('add 1101,4,5,6,99,1,0 -> 1(add): imm(4) + imm(5) = (9)>pos[6]', async () => {
      expect.assertions(2);
      let buffer = [1101, 4, 5, 6, 99, 1, 0];
      let size = await executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([1101, 4, 5, 6, 99, 1, 9]);
    });
  });

  describe('opcode 2: multiply', () => {
    test('multiply 2,3,4,5,99 -> 2(multiply): pos[3]>(5) * pos[4]>(99) = (495)>pos[5]', async () => {
      expect.assertions(2);
      let buffer = [2, 3, 4, 5, 99];
      let size = await executeCommand(buffer);

      expect(size).toBe(4);
      expect(buffer).toEqual([2, 3, 4, 5, 99, 495]);
    });

    test('multiply 2,5,6,7,99,3,4,0 -> 2(multiply): pos[5]>(3) * pos[6]>(4) = (12)>pos[7]', async () => {
      expect.assertions(2);
      let buffer = [2, 5, 6, 7, 99, 3, 4, 0];
      let size = await executeCommand(buffer);

      expect(size).toBe(4);
      expect(buffer).toEqual([2, 5, 6, 7, 99, 3, 4, 12]);
    });

    test('multiply 102,5,6,7,99,3,4,0 -> 2(multiply): imm(5) * pos[6]>(4) = (20)>pos[7]', async () => {
      expect.assertions(2);
      let buffer = [102, 5, 6, 7, 99, 3, 4, 0];
      let size = await executeCommand(buffer);

      expect(size).toBe(4);
      expect(buffer).toEqual([102, 5, 6, 7, 99, 3, 4, 20]);
    });

    test('multiply 1002,5,6,7,99,3,4,0 -> 2(multiply): pos[5]>(3) * imm(6) = (18)>pos[7]', async () => {
      expect.assertions(2);
      let buffer = [1002, 5, 6, 7, 99, 3, 4, 0];
      let size = await executeCommand(buffer);

      expect(size).toBe(4);
      expect(buffer).toEqual([1002, 5, 6, 7, 99, 3, 4, 18]);
    });

    test('multiply 1102,5,6,7,99,3,4,0 -> 2(multiply): imm(5) * imm(6) = (30)>pos[7]', async () => {
      expect.assertions(2);
      let buffer = [1102, 5, 6, 7, 99, 3, 4, 0];
      let size = await executeCommand(buffer);

      expect(size).toBe(4);
      expect(buffer).toEqual([1102, 5, 6, 7, 99, 3, 4, 30]);
    });
  });

  describe('opcode 3: input', () => {
    // Opcode 3 takes a single integer as input and saves it to the position given by its only parameter. 
    // For example, the instruction 3,50 would take an input value and store it at address 50.
    test('input 3,1,99 ', async () => {
      expect.assertions(3);
      let buffer = [3, 1, 99];
      let input = jest.fn(() => 3333);
      let size = await executeCommand(buffer, 0, input);

      expect(size).toBe(2);
      expect(buffer).toEqual([3, 3333, 99]);
      expect(input).toHaveBeenCalled();
    });

    test('input 3,3,99,0', async () => {
      expect.assertions(3);
      let buffer = [3, 3, 99, 0];
      let input = jest.fn(() => 3333);
      let size = await executeCommand(buffer, 0, input);

      expect(size).toBe(2);
      expect(buffer).toEqual([3, 3, 99, 3333]);
      expect(input).toHaveBeenCalled();
    });

    test('input async function', async () => {
      expect.assertions(1);
      let buffer = [3, 3, 99, 0];

      async function inputFn() {
        return 3333;
      }

      let size = await executeCommand(buffer, 0, inputFn);

      expect(buffer).toEqual([3, 3, 99, 3333]);
    })

    test('input async generator', async () => {
      expect.assertions(1);
      let buffer = [3, 3, 99, 0];

      async function* gen() {
        yield 3333;
      }

      let size = await executeCommand(buffer, 0, gen());

      expect(buffer).toEqual([3, 3, 99, 3333]);
    })
  });

  describe('opcode 4: output', () => {
    // Opcode 4 outputs the value of its only parameter. 
    // For example, the instruction 4,50 would output the value at address 50.
    test('output 4,2,99 -> 4(output): pos[2](99)', async () => {
      expect.assertions(3);
      let buffer = [4, 2, 99];
      let input = jest.fn(() => 3333);
      let output = jest.fn();
      let size = await executeCommand(buffer, 0, input, output);

      expect(size).toBe(2);
      expect(buffer).toEqual([4, 2, 99]);
      expect(output).toHaveBeenCalledWith(99);
    });

    test('output 4,3,99,4444 -> 4(output): pos[3](4444)', async () => {
      expect.assertions(3);
      let buffer = [4, 3, 99, 4444];
      let input = jest.fn(() => 3333);
      let output = jest.fn();
      let size = await executeCommand(buffer, 0, input, output);

      expect(size).toBe(2);
      expect(buffer).toEqual([4, 3, 99, 4444]);
      expect(output).toHaveBeenCalledWith(4444);
    });

    test('output 104,2,99 -> 4(output): imm[2](2)', async () => {
      expect.assertions(3);
      let buffer = [104, 2, 99];
      let input = jest.fn(() => 3333);
      let output = jest.fn();
      let size = await executeCommand(buffer, 0, input, output);

      expect(size).toBe(2);
      expect(buffer).toEqual([104, 2, 99]);
      expect(output).toHaveBeenCalledWith(2);
    });

    test('output 104,3,99,4444 -> 4(output): imm[3](3)', async () => {
      expect.assertions(3);
      let buffer = [104, 3, 99, 4444];
      let input = jest.fn(() => 3333);
      let output = jest.fn();
      let size = await executeCommand(buffer, 0, input, output);

      expect(size).toBe(2);
      expect(buffer).toEqual([104, 3, 99, 4444]);
      expect(output).toHaveBeenCalledWith(3);
    });
  });

  describe('parameter modes', () => {
    // Each parameter of an instruction is handled based on its parameter mode. 
    // Parameter mode 0, position mode, causes the parameter to be interpreted as a position
    // - if the parameter is 50, its value is the value stored at address 50 in memory. 
    // Parameter mode 1, immediate mode, a parameter is interpreted as a value
    // - if the parameter is 50, its value is simply 50.

    // Example:   ABCDE
    //             1002
    //   DE - two-digit opcode,      02 == opcode 2
    //   C - mode of 1st parameter,  0 == position mode
    //   B - mode of 2nd parameter,  1 == immediate mode
    //   A - mode of 3rd parameter,  0 == position mode,
    //                                     omitted due to being a leading zero
    test('example 1002,4,3,4,33 -> 2(multiply): pos[4]>(33) * imm(3) = (99)>pos[4]', async () => {
      expect.assertions(2);
      let buffer = [1002, 4, 3, 4, 33];
      let size = await executeCommand(buffer, 0);
      // 2(multiply): pos[4]>(33) * imm[3]>(3) = (99)>pos[4]
      expect(size).toBe(4);
      expect(buffer).toEqual([1002, 4, 3, 4, 99]);
    });

    // Integers can be negative: 1101,100,-1,4,0 is a valid program 
    // (find 100 + -1, store the result in position 4).
    test('example 1101,100,-1,4,0 -> 1(add): imm(100) + imm(-1) = (99)>pos[4]', async () => {
      expect.assertions(2);
      let buffer = [1101, 100, -1, 4, 0];
      let size = await executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([1101, 100, -1, 4, 99]);
    })

    // Parameters in mode 2, relative mode, behave very similarly to parameters in position mode: 
    // the parameter is interpreted as a position. Like position mode, parameters in relative mode 
    // can be read from or written to.

    // The important difference is that relative mode parameters don't count from address 0. 
    // Instead, they count from a value called the relative base. The relative base starts at 0.

    // The address a relative mode parameter refers to is itself plus the current relative base. 

    // When the relative base is 0, relative mode parameters and position mode parameters with 
    // the same value refer to the same address.
    test('relative mode: when relative base is 0, releative mode and position mode are the same.', async () => {
      // multiply 22202,3,4,5,99 -> 2(multiply): rel[0+3]>(5) * rel[0+4]>(99) = (495)>rel[0+5]
      expect.assertions(2);
      let buffer = [22202, 7, 8, 9, 99, 0, 0, 33, 10, 0];
      let size = await executeCommand(buffer);

      expect(size).toBe(4);
      expect(buffer).toEqual([22202, 7, 8, 9, 99, 0, 0, 33, 10, 330]);
    });

    test('relative mode: relative base = 50, a relative mode parameter of -7 refers to memory address 50 + -7 = 43.', async () => {
      expect.assertions(2);
      let buffer = [22202, -43, -42, -41, 99, 0, 0, 33, 10, 0];
      const state = { ptr: 0, relBase: 50 };

      let size = await executeCommand(buffer, state);

      expect(size).toBe(4);
      expect(buffer).toEqual([22202, -43, -42, -41, 99, 0, 0, 33, 10, 330]);

    })
  });

  describe('opcode 5: jump-if-true', () => {
    // Opcode 5 is jump-if-true: if the first parameter is non-zero, 
    // it sets the instruction pointer to the value from the second parameter. 
    // Otherwise, it does nothing.
    test('jump-if-true, non-jump', async () => {
      expect.assertions(2);
      let ptr = 0; //               >
      let ptrDelta = await executeCommand([1105, 0, 7, 1101, 1, 1, 1, 99], ptr);
      // 0 is not non-zero so increment ptr by size(opcode).
      expect(ptrDelta).toBe(3);
      expect(ptr + ptrDelta).toBe(3);
    });

    test('jump-if-true, jump forwards', async () => {
      expect.assertions(2);
      let ptr = 0; //               >
      let ptrDelta = await executeCommand([1105, 777, 7, 1101, 1, 1, 1, 99], ptr);
      // 777 is non-zero so jump to ptr=7.
      expect(ptrDelta).toBe(7);
      expect(ptr + ptrDelta).toBe(7);
    });

    test('jump-if-true, jump backwards', async () => {
      expect.assertions(2);
      let ptr = 4; //                              >
      let ptrDelta = await executeCommand([1101, 1, 1, 1, 1105, 777, 0, 99], 4);
      // 777 is non-zero so jump to ptr=7.
      expect(ptrDelta).toBe(-4);
      expect(ptr + ptrDelta).toBe(0);
    });
  });

  describe('opcode 6: jump-if-false', () => {
    // Opcode 6 is jump-if-false: if the first parameter is zero, 
    // it sets the instruction pointer to the value from the second parameter. 
    // Otherwise, it does nothing.
    test('jump-if-false, non-jump', async () => {
      expect.assertions(2);
      let ptr = 0; //               >
      let ptrDelta = await executeCommand([1106, 777, 7, 1101, 1, 1, 1, 99], ptr);
      // 777 is non-zero so increment ptr by size(opcode).
      expect(ptrDelta).toBe(3);
      expect(ptr + ptrDelta).toBe(3);
    });

    test('jump-if-false, jump forwards', async () => {
      expect.assertions(2);
      let ptr = 0; //               >
      let ptrDelta = await executeCommand([1106, 0, 7, 1101, 1, 1, 1, 99], ptr);
      // 0 is not non-zero so jump to ptr=7.
      expect(ptrDelta).toBe(7);
      expect(ptr + ptrDelta).toBe(7);
    });

    test('jump-if-false, jump backwards', async () => {
      expect.assertions(2);
      let ptr = 4; //                              >
      let ptrDelta = await executeCommand([1101, 1, 1, 1, 1106, 0, 0, 99], ptr);
      // 0 is not non-zero so jump to ptr=7.
      expect(ptrDelta).toBe(-4);
      expect(ptr + ptrDelta).toBe(0);
    });
  });

  describe('opcode 7: less than', () => {
    // Opcode 7 is less than: if the first parameter is less than the second parameter, 
    // it stores 1 in the position given by the third parameter. 
    // Otherwise, it stores 0.
    test('less-than, is less-than', async () => {
      expect.assertions(2);
      let buffer = [1107, -1, 77, 7, 99, 0, 0, 555];
      let ptr = 0; // ^
      let ptrDelta = await executeCommand(buffer, ptr);
      expect(ptrDelta).toBe(4);
      expect(buffer[7]).toBe(1);
    });
    test('less-than, not less-than', async () => {
      expect.assertions(2);
      let buffer = [1107, 77, -1, 7, 99, 0, 0, 555];
      let ptr = 0; // ^
      let ptrDelta = await executeCommand(buffer, ptr);
      expect(ptrDelta).toBe(4);
      expect(buffer[7]).toBe(0);
    });
    test('less-than, position mode, is less-than', async () => {
      expect.assertions(2);
      let buffer = [7, 5, 6, 7, 99, -1, 77, 555];
      let ptr = 0;
      let ptrDelta = await executeCommand(buffer, ptr);
      expect(ptrDelta).toBe(4);
      expect(buffer[7]).toBe(1);
    });
    test('less-than, position mode, not less-than', async () => {
      expect.assertions(2);
      let buffer = [7, 5, 6, 7, 99, 77, -1, 555];
      let ptr = 0;
      let ptrDelta = await executeCommand(buffer, ptr);
      expect(ptrDelta).toBe(4);
      expect(buffer[7]).toBe(0);
    });
  });

  describe('opcode 8: equals', () => {
    // Opcode 8 is equals: if the first parameter is equal to the second parameter, 
    // it stores 1 in the position given by the third parameter. 
    // Otherwise, it stores 0.
    test('equals, immediate mode, is equals', async () => {
      expect.assertions(2);
      let buffer = [1108, -77, -77, 7, 99, 0, 0, 555];
      let ptr = 0; // ^
      let ptrDelta = await executeCommand(buffer, ptr);
      expect(ptrDelta).toBe(4);
      expect(buffer[7]).toBe(1);
    });
    test('equals, immediate mode, not equals', async () => {
      expect.assertions(2);
      let buffer = [1108, 77, -77, 7, 99, 0, 0, 555];
      let ptr = 0; // ^
      let ptrDelta = await executeCommand(buffer, ptr);
      expect(ptrDelta).toBe(4);
      expect(buffer[7]).toBe(0);
    });
    test('equals, position mode, is equals', async () => {
      expect.assertions(2);
      let buffer = [8, 5, 6, 7, 99, -1, -1, 555];
      let ptr = 0;
      let ptrDelta = await executeCommand(buffer, ptr);
      expect(ptrDelta).toBe(4);
      expect(buffer[7]).toBe(1);
    });
    test('equals, position mode, not equals', async () => {
      expect.assertions(2);
      let buffer = [8, 5, 6, 7, 99, 77, -1, 555];
      let ptr = 0;
      let ptrDelta = await executeCommand(buffer, ptr);
      expect(ptrDelta).toBe(4);
      expect(buffer[7]).toBe(0);
    });
  });

  describe('opcode 9: adjust relative base', () => {
    // Opcode 9 adjusts the relative base by the value of its only parameter. The relative base 
    // increases (or decreases, if the value is negative) by the value of the parameter.

    test('relative mode: relative base increments', async () => {
      expect.assertions(1);
      let buffer = [22201, -3, -2, -1, 99, 0, 0, 1, 1];

      for (let relBase = 10; relBase < 15; relBase += 1) {
        const state = { ptr: 0, relBase };

        await executeCommand(buffer, state);
      }

      expect(buffer).toEqual([22201, -3, -2, -1, 99, 0, 0, 1, 1, 2, 3, 5, 8, 13]);
    });
  });

  describe('opcode 99: stop', () => {
    test('stop 1,4,5,6,*>99,1,0', async () => {
      expect.assertions(2);
      let buffer = [1, 4, 5, 6, 99, 1, 0];
      let result = await executeCommand(buffer, 4);

      expect(result).toBe(false);
      expect(buffer).toEqual([1, 4, 5, 6, 99, 1, 0]);
    });
  });
});

describe('executeProgram', () => {

  describe('Opcode 1 & 2: initial and final states of a few more small programs', () => {

    test('1,4,5,6,99,1,0', async () => {
      expect.assertions(1);
      let buffer = [1, 4, 5, 6, 99, 1, 0];
      await executeProgram(buffer);

      expect(buffer).toEqual([1, 4, 5, 6, 99, 1, 100]);
    });

    /*
    Here are the initial and final states of a few more small programs:

    1,0,0,0,99 becomes 2,0,0,0,99 (1 + 1 = 2).
    2,3,0,3,99 becomes 2,3,0,6,99 (3 * 2 = 6).
    2,4,4,5,99,0 becomes 2,4,4,5,99,9801 (99 * 99 = 9801).
    1,1,1,4,99,5,6,0,99 becomes 30,1,1,4,2,5,6,0,99.
    */

    test('1,0,0,0,99 becomes 2,0,0,0,99 (1 + 1 = 2).', async () => {
      expect.assertions(1);
      let buffer = [1, 0, 0, 0, 99];
      await executeProgram(buffer);

      expect(buffer).toEqual([2, 0, 0, 0, 99]);
    });

    test('2,3,0,3,99 becomes 2,3,0,6,99 (3 * 2 = 6).', async () => {
      expect.assertions(1);
      let buffer = [2, 3, 0, 3, 99];
      await executeProgram(buffer);

      expect(buffer).toEqual([2, 3, 0, 6, 99]);
    });

    test('2,4,4,5,99,0 becomes 2,4,4,5,99,9801 (99 * 99 = 9801).', async () => {
      expect.assertions(1);
      let buffer = [2, 4, 4, 5, 99, 0];
      await executeProgram(buffer);

      expect(buffer).toEqual([2, 4, 4, 5, 99, 9801]);
    });

    test('1,1,1,4,99,5,6,0,99 becomes 30,1,1,4,2,5,6,0,99.', async () => {
      expect.assertions(1);
      let buffer = [1, 1, 1, 4, 99, 5, 6, 0, 99];
      await executeProgram(buffer);

      expect(buffer).toEqual([30, 1, 1, 4, 2, 5, 6, 0, 99]);
    });

    test('1,9,10,3,2,3,11,0,99,30,40,50 becomes 3500,9,10,70,2,3,11,0,99,30,40,50', async () => {
      expect.assertions(1);
      buffer = [1, 9, 10, 3, 2, 3, 11, 0, 99, 30, 40, 50];
      await executeProgram(buffer);

      expect(buffer).toEqual([3500, 9, 10, 70, 2, 3, 11, 0, 99, 30, 40, 50]);
    });
  });

  describe('Opcode 3 & 4 example', () => {
    // Opcode 3 takes a single integer as input and saves it to the position given by its only parameter. 
    // For example, the instruction 3,50 would take an input value and store it at address 50.
    // Opcode 4 outputs the value of its only parameter. 
    // For example, the instruction 4,50 would output the value at address 50.
    // Programs that use these instructions will come with documentation that explains what should be 
    // connected to the input and output. 
    // The program 3,0,4,0,99 outputs whatever it gets as input, then halts.
    test('input output 3,0,4,0,99', async () => {
      expect.assertions(4);
      let buffer = [3, 0, 4, 0, 99];
      let input = jest.fn(() => 7777);
      let output = jest.fn();
      await executeProgram(buffer, input, output);

      expect(buffer).toEqual([7777, 0, 4, 0, 99]);
      expect(input).toHaveBeenCalledTimes(1);
      expect(output).toHaveBeenCalledTimes(1);
      expect(output).toHaveBeenCalledWith(7777);
    });
  });

  describe('Opcode 5 & 6: some jump tests that take an input, then output 0 if the input was zero or 1 if the input was non-zero', () => {

    // Here are some jump tests that take an input, then output 0 if the input was zero or 1 if the input was non-zero:

    // 3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9 (using position mode)
    // 3,3,1105,-1,9,1101,0,0,12,4,12,99,1 (using immediate mode)
    describe.each([
      ['immediate mode', [3, 3, 1105, -1, 9, 1101, 0, 0, 12, 4, 12, 99, 1]],
      ['position mode', [3, 12, 6, 12, 15, 1, 13, 14, 13, 4, 13, 99, -1, 0, 1, 9]]
    ])('Example program using %s', (_, bufferTemplate) => {

      // take an input, then output 0 if the input was zero or 1 if the input was non-zero:
      test.each([
        [1, 'non-zero', 1],
        [0, 'not non-zero', 0],
        [-1, 'non-zero', 1],
        [-1000, 'non-zero', 1],
        [2000, 'non-zero', 1],
        [NaN, 'non-zero', 1],
      ])('Input %i is %s and so returns %i.', async (input, _, output) => {

        expect.assertions(1);
        let buffer = bufferTemplate.slice();
        let outputFn = jest.fn();

        await executeProgram(buffer, () => input, outputFn);

        expect(outputFn).toHaveBeenCalledWith(output);
      });
    });

  });

  describe('Opcode 7 & 8: several programs that take one input, compare it to the value 8', () => {

    // 3,9,7,9,10,9,4,9,99,-1,8 - Using position mode, consider whether the input is less than 8; output 1 (if it is) or 0 (if it is not).
    // 3,3,1107,-1,8,3,4,3,99 - Using immediate mode, consider whether the input is less than 8; output 1 (if it is) or 0 (if it is not).
    describe.each([
      [7, 'position mode', [3, 9, 7, 9, 10, 9, 4, 9, 99, -1, 8]],
      [1107, 'immediate mode', [3, 3, 1107, -1, 8, 3, 4, 3, 99]],
    ])('Opcode %i: Using %s, consider if the input is less than 8;', (_, __, bufferTemplate) => {

      // take an input, then output 0 if the input was zero or 1 if the input was non-zero:
      test.each([
        [1, 'less than', 1],
        [8, 'not less than', 0],
        [10, 'not less than', 0],
        [-1000, 'less than', 1],
        [2000, 'not less than', 0],
        [NaN, 'not less than', 0],
      ])('Input %i is %s to 8 and so returns %i.', async (input, _, output) => {

        expect.assertions(1);
        let buffer = bufferTemplate.slice();
        let outputFn = jest.fn();

        await executeProgram(buffer, () => input, outputFn);

        expect(outputFn).lastCalledWith(output);
      });
    });

    // 3,9,8,9,10,9,4,9,99,-1,8 - Using position mode, consider whether the input is equal to 8; output 1 (if it is) or 0 (if it is not).
    // 3,3,1108,-1,8,3,4,3,99 - Using immediate mode, consider whether the input is equal to 8; output 1 (if it is) or 0 (if it is not).
    describe.each([
      [8, 'position mode', [3, 9, 8, 9, 10, 9, 4, 9, 99, -1, 8]],
      [1108, 'immediate mode', [3, 3, 1108, -1, 8, 3, 4, 3, 99]],
    ])('Opcode %i: Using %s, consider if the input is equal to 8;', (_, __, bufferTemplate) => {

      // take an input, then output 0 if the input was zero or 1 if the input was non-zero:
      test.each([
        [1, 'not equal', 0],
        [8, 'equal', 1],
        [10, 'not equal', 0],
        [-1000, 'not equal', 0],
        [2000, 'not equal', 0],
        [NaN, 'not equal', 0],
      ])('Input %i is %s to 8 and so returns %i.', async (input, _, output) => {

        expect.assertions(1);
        let buffer = bufferTemplate.slice();
        let outputFn = jest.fn();

        await executeProgram(buffer, () => input, outputFn);

        expect(outputFn).lastCalledWith(output);
      });
    });

  });

  describe('Opcodes 5-8: a larger example', () => {

    //   Here's a larger example:

    // 3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,
    // 1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,
    // 999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99
    let bufferTemplate = [3, 21, 1008, 21, 8, 20, 1005, 20, 22, 107, 8, 21, 20, 1006, 20, 31,
      1106, 0, 36, 98, 0, 0, 1002, 21, 125, 20, 4, 20, 1105, 1, 46, 104,
      999, 1105, 1, 46, 1101, 1000, 1, 20, 4, 20, 1105, 1, 46, 98, 99];
    let outputFn = jest.fn();

    test.each([
      [999, 'below 8', -5],
      [999, 'below 8', 3],
      [1000, 'equal to 8', 8],
      [1001, 'greater than 8', 10],
      [1001, 'greater than 8', 1000],
    ])('The program will output %i if the input value is %s (e.g. %i)', async (output, _, input) => {
      expect.assertions(1);
      let buffer = bufferTemplate.slice();
      outputFn.mockClear();

      await executeProgram(buffer, () => input, outputFn);

      expect(outputFn).toHaveBeenCalledWith(output);
    });
  });
});

describe('executeProgramAsGenerator', () => {

  describe('Opcode 3 & 4 example', () => {
    // Opcode 3 takes a single integer as input and saves it to the position given by its only parameter. 
    // For example, the instruction 3,50 would take an input value and store it at address 50.
    // Opcode 4 outputs the value of its only parameter. 
    // For example, the instruction 4,50 would output the value at address 50.
    // Programs that use these instructions will come with documentation that explains what should be 
    // connected to the input and output. 
    // The program 3,0,4,0,99 outputs whatever it gets as input, then halts.
    test('input output 3,0,4,0,99', async () => {
      expect.assertions(3);
      let buffer = [3, 0, 4, 0, 99];
      let input = jest.fn(() => 7777);

      for await (const output of executeProgramAsGenerator(buffer, input)) {
        expect(output).toBe(7777);
      }

      expect(buffer).toEqual([7777, 0, 4, 0, 99]);
      expect(input).toHaveBeenCalledTimes(1);
    });
  });

  describe('Async Input pauses program', () => {
    test('output 4,0,99', async () => {
      expect.assertions(2);
      let buffer = [4, 0, 99];
      let logData = [];
      let t0 = Date.now();

      for await (const value of executeProgramAsGenerator(buffer)) {
        logData.push({
          value,
          time: (Date.now() - t0)
        });
      }

      expect(logData.length).toBe(1);
      expect(logData.map(o => o.value)).toEqual([4]);
    });

    test('output input output 4,0,3,0,4,0,99', async () => {
      // DO NOT USE jest.useFakeTimers();
      expect.assertions(6);
      let buffer = [4, 0, 3, 0, 4, 0, 99];
      let logValues = [];
      let logTimes = [];
      let delayMs = 50;

      // NB. We're using setTimeout to check if the program is being paused.
      let t0 = Date.now();
      async function inputFn() {
        return await new Promise((resolve) => {
          setTimeout(() => {
            resolve(7777);
          }, delayMs)
        });
      }

      for await (const value of executeProgramAsGenerator(buffer, inputFn)) {
        logValues.push(value);
        logTimes.push(Date.now() - t0);
      }

      expect(logValues.length).toBe(2);
      expect(logValues).toEqual([4, 7777]);

      // NB. We're using setTimeout to check if the program is being paused.
      //     This is bad practice but difficult to test otherwise using
      //     for await .. of  with an AsyncGenerator()

      // The 1st output should be 0-2 ms so 0-10ms is generous.
      expect(logTimes[0]).toBeGreaterThanOrEqual(0);
      expect(logTimes[0]).toBeLessThanOrEqual(10);
      // The 2nd output should be ~50ms so 49-100ms is generous.
      expect(logTimes[1]).toBeGreaterThanOrEqual(delayMs - 1);
      expect(logTimes[1]).toBeLessThanOrEqual(delayMs * 2);
    });
  });

  describe('Opcode 9 & other capabilities', () => {
    // Opcode 9 adjusts the relative base by the value of its only parameter. The relative base 
    // increases (or decreases, if the value is negative) by the value of the parameter.

    // Your Intcode computer will also need a few other capabilities:

    // The computer's available memory should be much larger than the initial program. Memory 
    // beyond the initial program starts with the value 0 and can be read or written like any 
    // other memory. (It is invalid to try to access memory at a negative address, though.)

    // The computer should have support for large numbers. Some instructions near the beginning of 
    // the BOOST program will verify this capability.

    //     Here are some example programs that use these features:
    test('example takes no input and produces a copy of itself as output.', async () => {
      // 109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99 takes no input and produces a copy of itself as output.
      let buffer = [109, 1, 204, -1, 1001, 100, 1, 100, 1008, 100, 16, 101, 1006, 101, 0, 99];
      let outputBuffer = [];

      for await (const value of executeProgramAsGenerator(buffer.slice())) {
        outputBuffer.push(value);
      }

      expect(outputBuffer).toEqual(buffer);
    });

    test('example should output a 16-digit number.', async () => {
      // 1102,34915192,34915192,7,4,7,99,0 should output a 16-digit number.
      const buffer = [1102, 34915192, 34915192, 7, 4, 7, 99, 0];
      let outputBuffer = [];

      for await (const value of executeProgramAsGenerator(buffer)) {
        outputBuffer.push(value);
      }

      expect(outputBuffer).toEqual([1219070632396864]);
    });

    test('example should output the large number in the middle.', async () => {
      // 104,1125899906842624,99 should output the large number in the middle.
      const buffer = [104, 1125899906842624, 99];
      let outputBuffer = [];

      for await (const value of executeProgramAsGenerator(buffer)) {
        outputBuffer.push(value);
      }

      expect(outputBuffer).toEqual([1125899906842624]);
    });

    test('relative base: fibbonacci sequence', async () => {
      let buffer = [
        109, 1,             // adjust relative base by +1
        22201, 15, 16, 17,  // add last two numbers
        204, 17,            // output result
        101, -1, 13, 13,    // decrement counter by 1
        1105, 10, 0,        // if counter > 0, set ptr to 0.
        99, 1, 1
      ];

      let outputBuffer = [];
      for await (const value of executeProgramAsGenerator(buffer)) {
        outputBuffer.push(value);
      }

      expect(outputBuffer).toEqual([2, 3, 5, 8, 13, 21, 34, 55, 89, 144]);
    });
  });
})

