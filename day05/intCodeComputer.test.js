const { executeCommand, executeProgram, executeNounVerbProgram } = require('./intCodeComputer');
const { loadInputFile } = require('./intCodeComputer');
const { findNounVerbInputs } = require('.');

describe('execute command', () => {
  test('Encountering an unknown opcode means something went wrong.', () => {
    expect(() => {
      executeCommand([13]);
    }).toThrow();
  })

  describe('opcode 1: add', () => {
    test('add 1,0,0,3', () => {
      let buffer = [1, 0, 0, 3];
      let result = executeCommand(buffer, 0);

      expect(result).toBe(4);
      expect(buffer).toEqual([1, 0, 0, 2]);
    });

    test('add 1,4,5,6,99,1,0', () => {
      let buffer = [1, 4, 5, 6, 99, 1, 0];
      let result = executeCommand(buffer, 0);

      expect(result).toBe(4);
      expect(buffer).toEqual([1, 4, 5, 6, 99, 1, 100]);
    });
  });

  describe('opcode 2: multiply', () => {
    test('multiply 2,3,4,5,99 - 5 * 99 ', () => {
      let buffer = [2, 3, 4, 5, 99];
      let result = executeCommand(buffer);

      expect(result).toBe(4);
      expect(buffer).toEqual([2, 3, 4, 5, 99, 495]);
    })
    test('multiply 2,5,6,7,99,3,4,0 - 3 * 4', () => {
      let buffer = [2, 5, 6, 7, 99, 3, 4, 0];
      let result = executeCommand(buffer);

      expect(result).toBe(4);
      expect(buffer).toEqual([2, 5, 6, 7, 99, 3, 4, 12]);
    })
  })

  describe('opcode 3: input', () => {
    // Opcode 3 takes a single integer as input and saves it to the position given by its only parameter. 
    // For example, the instruction 3,50 would take an input value and store it at address 50.
    test('input 3,1,99 ', () => {
      let buffer = [3, 1, 99];
      let input = jest.fn(() => 3333);
      let result = executeCommand(buffer, 0, input);

      expect(result).toBe(2);
      expect(buffer).toEqual([3, 3333, 99]);
      expect(input).toHaveBeenCalled();
    });

    test('input 3,3,99,0', () => {
      let buffer = [3, 3, 99, 0];
      let input = jest.fn(() => 3333);
      let result = executeCommand(buffer, 0, input);

      expect(result).toBe(2);
      expect(buffer).toEqual([3, 3, 99, 3333]);
      expect(input).toHaveBeenCalled();
    });
  });

  describe('opcode 4: output', () => {
    // Opcode 4 outputs the value of its only parameter. 
    // For example, the instruction 4,50 would output the value at address 50.
    test('output 4,2,99 ', () => {
      let buffer = [4, 2, 99];
      let input = jest.fn(() => 3333);
      let output = jest.fn();
      let result = executeCommand(buffer, 0, input, output);

      expect(result).toBe(2);
      expect(buffer).toEqual([4, 2, 99]);
      expect(output).toHaveBeenCalledWith(99);
    });

    test('input 3,3,99,0', () => {
      let buffer = [4, 3, 99, 4444];
      let input = jest.fn(() => 3333);
      let output = jest.fn();
      let result = executeCommand(buffer, 0, input, output);

      expect(result).toBe(2);
      expect(buffer).toEqual([4, 3, 99, 4444]);
      expect(output).toHaveBeenCalledWith(4444);
    });
  })

  describe('opcode 99: stop', () => {
    test('stop 1,4,5,6,*>99,1,0', () => {
      let buffer = [1, 4, 5, 6, 99, 1, 0];
      let result = executeCommand(buffer, 4);

      expect(result).toBe(false);
      expect(buffer).toEqual([1, 4, 5, 6, 99, 1, 0]);
    });
  })
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
