const { executeCommand, executeProgram, loadInputFile, process1202Program, executeNounVerbProgram, findNounVerbInputs } = require('.');

let filename = __dirname + '/input.txt';

describe('Day 2: 1202 Program Alarm', () => {
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

      test('add 1,4,5,6,99,1,0', () => {
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

  });

  describe('loadInputFile() and process1202Program()', () => {
    test('loadInputFile', async () => {
      expect.assertions(1);

      let buffer = await loadInputFile(filename)

      expect(buffer).toEqual(expect.arrayContaining([1, 0, 0, 3, 1, 1, 2, 3]));
    });

    test('process1202Program', async () => {
      expect.assertions(1);

      let result = await process1202Program(filename)

      expect(result).toEqual(3716293);
    });

    test('executeNounVerbProgram', async () => {
      expect.assertions(1);

      let buffer = await loadInputFile(filename)

      let result = await executeNounVerbProgram(12, 2, buffer);

      expect(result).toEqual(3716293);
    });

    test('executeNounVerbProgram', async () => {
      expect.assertions(1);

      let buffer = await loadInputFile(filename)

      let result = await executeNounVerbProgram(14, 2, buffer);

      expect(result).toEqual(4330693);
    });

    test('executeNounVerbProgram', async () => {
      expect.assertions(1);

      let buffer = await loadInputFile(filename)

      let result = await executeNounVerbProgram(14, 4, buffer);

      expect(result).toEqual(4330695);
    });
  });

  /*
  "With terminology out of the way, we're ready to proceed. To complete the gravity assist, you need to determine what pair of inputs produces the output 19690720."
  */
  describe.skip('find noun verb inputs', () => {

    test('find 12 02 for 3716293', async () => {
      let { noun, verb } = await findNounVerbInputs(filename, 3716293);
      expect(noun).toBe(12);
      expect(verb).toBe(2);
    });

    test('find 14 02 for 4330693', async () => {
      let { noun, verb } = await findNounVerbInputs(filename, 4330693);
      expect(noun).toBe(14);
      expect(verb).toBe(2);
    });

    test('find 14 04 for 4330695', async () => {
      let { noun, verb } = await findNounVerbInputs(filename, 4330695);
      expect(noun).toBe(14);
      expect(verb).toBe(4);
    });

    describe('complete the gravity assist', () => {
      test('find 64 29 for 19690720', async () => {
        let { noun, verb } = await findNounVerbInputs(filename, 19690720);
        expect(noun).toBe(64);
        expect(verb).toBe(29);
      });
    });
  });
});
