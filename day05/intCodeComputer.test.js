const { executeCommand, executeProgram, executeNounVerbProgram } = require('./intCodeComputer');
const { loadInputFile } = require('./intCodeComputer');
const { findNounVerbInputs } = require('.');

describe('execute command', () => {
  test('Encountering an unknown opcode means something went wrong.', () => {
    expect(() => {
      executeCommand([13]);
    }).toThrow();
  });

  describe('opcode 1: add', () => {
    test('add 1,0,0,3 -> 1(add): pos[0]>(1) + pos[0]>(1) = (2)>pos[3]', () => {
      let buffer = [1, 0, 0, 3];
      let size = executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([1, 0, 0, 2]);
    });

    test('add 1,4,5,6,99,1,0 -> 1(add): pos[4]>(99) + pos[5]>(1) = (100)>pos[6]', () => {
      let buffer = [1, 4, 5, 6, 99, 1, 0];
      let size = executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([1, 4, 5, 6, 99, 1, 100]);
    });

    test('add 101,20,0,3 -> 1(add): imm(20) + pos[0]>(101) = (121)>pos[3]', () => {
      let buffer = [101, 20, 0, 3];
      let size = executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([101, 20, 0, 121]);
    });

    test('add 101,4,5,6,99,1,0 -> 1(add): imm(4) + pos[5]>(1) = (5)>pos[6]', () => {
      let buffer = [101, 4, 5, 6, 99, 1, 0];
      let size = executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([101, 4, 5, 6, 99, 1, 5]);
    });

    test('add 1001,4,5,6,99,1,0 -> 1(add): pos[4]>(99) + imm(5) = (104)>pos[6]', () => {
      let buffer = [1001, 4, 5, 6, 99, 1, 0];
      let size = executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([1001, 4, 5, 6, 99, 1, 104]);
    });

    test('add 1101,4,5,6,99,1,0 -> 1(add): imm(4) + imm(5) = (9)>pos[6]', () => {
      let buffer = [1101, 4, 5, 6, 99, 1, 0];
      let size = executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([1101, 4, 5, 6, 99, 1, 9]);
    });
  });

  describe('opcode 2: multiply', () => {
    test('multiply 2,3,4,5,99 -> 2(multiply): pos[3]>(5) * pos[4]>(99) = (495)>pos[5]', () => {
      let buffer = [2, 3, 4, 5, 99];
      let size = executeCommand(buffer);

      expect(size).toBe(4);
      expect(buffer).toEqual([2, 3, 4, 5, 99, 495]);
    });

    test('multiply 2,5,6,7,99,3,4,0 -> 2(multiply): pos[5]>(3) * pos[6]>(4) = (12)>pos[7]', () => {
      let buffer = [2, 5, 6, 7, 99, 3, 4, 0];
      let size = executeCommand(buffer);

      expect(size).toBe(4);
      expect(buffer).toEqual([2, 5, 6, 7, 99, 3, 4, 12]);
    });

    test('multiply 102,5,6,7,99,3,4,0 -> 2(multiply): imm(5) * pos[6]>(4) = (20)>pos[7]', () => {
      let buffer = [102, 5, 6, 7, 99, 3, 4, 0];
      let size = executeCommand(buffer);

      expect(size).toBe(4);
      expect(buffer).toEqual([102, 5, 6, 7, 99, 3, 4, 20]);
    });

    test('multiply 1002,5,6,7,99,3,4,0 -> 2(multiply): pos[5]>(3) * imm(6) = (18)>pos[7]', () => {
      let buffer = [1002, 5, 6, 7, 99, 3, 4, 0];
      let size = executeCommand(buffer);

      expect(size).toBe(4);
      expect(buffer).toEqual([1002, 5, 6, 7, 99, 3, 4, 18]);
    });

    test('multiply 1102,5,6,7,99,3,4,0 -> 2(multiply): imm(5) * imm(6) = (30)>pos[7]', () => {
      let buffer = [1102, 5, 6, 7, 99, 3, 4, 0];
      let size = executeCommand(buffer);

      expect(size).toBe(4);
      expect(buffer).toEqual([1102, 5, 6, 7, 99, 3, 4, 30]);
    });
  });

  describe('opcode 3: input', () => {
    // Opcode 3 takes a single integer as input and saves it to the position given by its only parameter. 
    // For example, the instruction 3,50 would take an input value and store it at address 50.
    test('input 3,1,99 ', () => {
      let buffer = [3, 1, 99];
      let input = jest.fn(() => 3333);
      let size = executeCommand(buffer, 0, input);

      expect(size).toBe(2);
      expect(buffer).toEqual([3, 3333, 99]);
      expect(input).toHaveBeenCalled();
    });

    test('input 3,3,99,0', () => {
      let buffer = [3, 3, 99, 0];
      let input = jest.fn(() => 3333);
      let size = executeCommand(buffer, 0, input);

      expect(size).toBe(2);
      expect(buffer).toEqual([3, 3, 99, 3333]);
      expect(input).toHaveBeenCalled();
    });
  });

  describe('opcode 4: output', () => {
    // Opcode 4 outputs the value of its only parameter. 
    // For example, the instruction 4,50 would output the value at address 50.
    test('output 4,2,99 -> 4(output): pos[2](99)', () => {
      let buffer = [4, 2, 99];
      let input = jest.fn(() => 3333);
      let output = jest.fn();
      let size = executeCommand(buffer, 0, input, output);

      expect(size).toBe(2);
      expect(buffer).toEqual([4, 2, 99]);
      expect(output).toHaveBeenCalledWith(99);
    });

    test('output 4,3,99,4444 -> 4(output): pos[3](4444)', () => {
      let buffer = [4, 3, 99, 4444];
      let input = jest.fn(() => 3333);
      let output = jest.fn();
      let size = executeCommand(buffer, 0, input, output);

      expect(size).toBe(2);
      expect(buffer).toEqual([4, 3, 99, 4444]);
      expect(output).toHaveBeenCalledWith(4444);
    });

    test('output 104,2,99 -> 4(output): imm[2](2)', () => {
      let buffer = [104, 2, 99];
      let input = jest.fn(() => 3333);
      let output = jest.fn();
      let size = executeCommand(buffer, 0, input, output);

      expect(size).toBe(2);
      expect(buffer).toEqual([104, 2, 99]);
      expect(output).toHaveBeenCalledWith(2);
    });

    test('output 104,3,99,4444 -> 4(output): imm[3](3)', () => {
      let buffer = [104, 3, 99, 4444];
      let input = jest.fn(() => 3333);
      let output = jest.fn();
      let size = executeCommand(buffer, 0, input, output);

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
    test('example 1002,4,3,4,33 -> 2(multiply): pos[4]>(33) * imm(3) = (99)>pos[4]', () => {
      let buffer = [1002, 4, 3, 4, 33];
      let size = executeCommand(buffer, 0);
      // 2(multiply): pos[4]>(33) * imm[3]>(3) = (99)>pos[4]
      expect(size).toBe(4);
      expect(buffer).toEqual([1002, 4, 3, 4, 99]);
    });

    // Integers can be negative: 1101,100,-1,4,0 is a valid program 
    // (find 100 + -1, store the result in position 4).
    test('example 1101,100,-1,4,0 -> 1(add): imm(100) + imm(-1) = (99)>pos[4]', () => {
      let buffer = [1101, 100, -1, 4, 0];
      let size = executeCommand(buffer, 0);

      expect(size).toBe(4);
      expect(buffer).toEqual([1101, 100, -1, 4, 99]);
    })
  });

  describe('opcode 99: stop', () => {
    test('stop 1,4,5,6,*>99,1,0', () => {
      let buffer = [1, 4, 5, 6, 99, 1, 0];
      let result = executeCommand(buffer, 4);

      expect(result).toBe(false);
      expect(buffer).toEqual([1, 4, 5, 6, 99, 1, 0]);
    });
  });
});

describe('executeProgram', () => {

  test('1,4,5,6,99,1,0', () => {
    let buffer = [1, 4, 5, 6, 99, 1, 0];
    executeProgram(buffer);

    expect(buffer).toEqual([1, 4, 5, 6, 99, 1, 100]);
  });

  /*
  Here are the initial and final states of a few more small programs:

  1,0,0,0,99 becomes 2,0,0,0,99 (1 + 1 = 2).
  2,3,0,3,99 becomes 2,3,0,6,99 (3 * 2 = 6).
  2,4,4,5,99,0 becomes 2,4,4,5,99,9801 (99 * 99 = 9801).
  1,1,1,4,99,5,6,0,99 becomes 30,1,1,4,2,5,6,0,99.
  */

  test('1,0,0,0,99 becomes 2,0,0,0,99 (1 + 1 = 2).', () => {
    let buffer = [1, 0, 0, 0, 99];
    executeProgram(buffer);

    expect(buffer).toEqual([2, 0, 0, 0, 99]);
  });

  test('2,3,0,3,99 becomes 2,3,0,6,99 (3 * 2 = 6).', () => {
    let buffer = [2, 3, 0, 3, 99];
    executeProgram(buffer);

    expect(buffer).toEqual([2, 3, 0, 6, 99]);
  });

  test('2,4,4,5,99,0 becomes 2,4,4,5,99,9801 (99 * 99 = 9801).', () => {
    let buffer = [2, 4, 4, 5, 99, 0];
    executeProgram(buffer);

    expect(buffer).toEqual([2, 4, 4, 5, 99, 9801]);
  });

  test('1,1,1,4,99,5,6,0,99 becomes 30,1,1,4,2,5,6,0,99.', () => {
    let buffer = [1, 1, 1, 4, 99, 5, 6, 0, 99];
    executeProgram(buffer);

    expect(buffer).toEqual([30, 1, 1, 4, 2, 5, 6, 0, 99]);
  });

  test('1,9,10,3,2,3,11,0,99,30,40,50 becomes 3500,9,10,70,2,3,11,0,99,30,40,50', () => {
    buffer = [1, 9, 10, 3, 2, 3, 11, 0, 99, 30, 40, 50];
    executeProgram(buffer);

    expect(buffer).toEqual([3500, 9, 10, 70, 2, 3, 11, 0, 99, 30, 40, 50]);
  });

  // Opcode 3 takes a single integer as input and saves it to the position given by its only parameter. 
  // For example, the instruction 3,50 would take an input value and store it at address 50.
  // Opcode 4 outputs the value of its only parameter. 
  // For example, the instruction 4,50 would output the value at address 50.
  // Programs that use these instructions will come with documentation that explains what should be 
  // connected to the input and output. 
  // The program 3,0,4,0,99 outputs whatever it gets as input, then halts.
  test('input output 3,0,4,0,99', () => {
    let buffer = [3, 0, 4, 0, 99];
    let input = jest.fn(() => 7777);
    let output = jest.fn();
    executeProgram(buffer, input, output);

    expect(buffer).toEqual([7777, 0, 4, 0, 99]);
    expect(input).toHaveBeenCalledTimes(1);
    expect(output).toHaveBeenCalledTimes(1);
    expect(output).toHaveBeenCalledWith(7777);
  });
});
