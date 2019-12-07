const {
  loadInputFile,
  executeNounVerbProgram
} = require('./intCodeComputer');
const {
  findNounVerbInputs,
  process1202Program
} = require('.');

let filename = __dirname + '/../day02/input.txt';

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
    test.skip('find 64 29 for 19690720', async () => {
      let { noun, verb } = await findNounVerbInputs(filename, 19690720);
      expect(noun).toBe(64);
      expect(verb).toBe(29);
    });
  });
});