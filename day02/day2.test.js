const { executeCommand, executeProgram, loadInputFile, processInputFile } = require('./day2');

test('Encountering an unknown opcode means something went wrong.', () => {
  expect(() => {
    executeCommand([13]);
  }).toThrow();
})

test('1,0,0,3 command', () => {
  let buffer = [1,0,0,3];
  let result = executeCommand(buffer, 0);

  expect(result).toBe(true);
  expect(buffer).toEqual([1,0,0,2]);
});

test('1,4,5,6,99,1,0 command', () => {
  let buffer = [1,4,5,6,99,1,0];
  let result = executeCommand(buffer, 0);

  expect(result).toBe(true);
  expect(buffer).toEqual([1,4,5,6,99,1,100]);
});

test('1,4,5,6,99,1,0 command', () => {
  let buffer = [1,4,5,6,99,1,0];
  let result = executeCommand(buffer, 4);

  expect(result).toBe(false);
  expect(buffer).toEqual([1,4,5,6,99,1,0]);
});

test('1,4,5,6,99,1,0 program', () => {
  let buffer = [1,4,5,6,99,1,0];
  executeProgram(buffer);

  expect(buffer).toEqual([1,4,5,6,99,1,100]);
});

/*
Here are the initial and final states of a few more small programs:

1,0,0,0,99 becomes 2,0,0,0,99 (1 + 1 = 2).
2,3,0,3,99 becomes 2,3,0,6,99 (3 * 2 = 6).
2,4,4,5,99,0 becomes 2,4,4,5,99,9801 (99 * 99 = 9801).
1,1,1,4,99,5,6,0,99 becomes 30,1,1,4,2,5,6,0,99.
*/

test('1,0,0,0,99 becomes 2,0,0,0,99 (1 + 1 = 2).', () => {
  let buffer = [1,0,0,0,99];
  executeProgram(buffer);

  expect(buffer).toEqual([2,0,0,0,99 ]);
});

test('2,3,0,3,99 becomes 2,3,0,6,99 (3 * 2 = 6).', () => {
  let buffer = [2,3,0,3,99];
  executeProgram(buffer);

  expect(buffer).toEqual([2,3,0,6,99]);
});

test('2,4,4,5,99,0 becomes 2,4,4,5,99,9801 (99 * 99 = 9801).', () => {
  let buffer = [2,4,4,5,99,0];
  executeProgram(buffer);

  expect(buffer).toEqual([2,4,4,5,99,9801]);
});

test('1,1,1,4,99,5,6,0,99 becomes 30,1,1,4,2,5,6,0,99.', () => {
  let buffer = [1,1,1,4,99,5,6,0,99];
  executeProgram(buffer);

  expect(buffer).toEqual([30,1,1,4,2,5,6,0,99]);
});

test('1,9,10,3,2,3,11,0,99,30,40,50 becomes 3500,9,10,70,2,3,11,0,99,30,40,50', () => {
  buffer = [1,9,10,3,2,3,11,0,99,30,40,50];
  executeProgram(buffer);

  expect(buffer).toEqual([3500,9,10,70,2,3,11,0,99,30,40,50]);
});

test('loadInputFile', async () => {
  expect.assertions(1);

  let filename = __dirname+'/input.txt';
  let buffer = await loadInputFile(filename)

  expect(buffer).toEqual(expect.arrayContaining([1,0,0,3,1,1,2,3]));
});

test('processInputFile', async () => {
  expect.assertions(1);

  let filename = __dirname+'/input.txt';
  let result = await processInputFile(filename)

  expect(result).toEqual(3716293);
});