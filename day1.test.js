const calculateFuel = require('./day1').calculateFuel;
const processInputFile = require('./day1').processInputFile;

/*
Fuel required to launch a given module is based on its mass. Specifically, to find the fuel required for a module, take its mass, divide by three, round down, and subtract 2.

For example:

For a mass of 12, divide by 3 and round down to get 4, then subtract 2 to get 2.
For a mass of 14, dividing by 3 and rounding down still yields 4, so the fuel required is also 2.
For a mass of 1969, the fuel required is 654.
For a mass of 100756, the fuel required is 33583.
*/

test('For a mass of 12, divide by 3 and round down to get 4, then subtract 2 to get 2.', () => {
  expect(calculateFuel(12)).toBe(2);
});

test('For a mass of 14, dividing by 3 and rounding down still yields 4, so the fuel required is also 2.', () => {
  expect(calculateFuel(14)).toBe(2);
});
test('For a mass of 1969, the fuel required is 654.', () => {
  expect(calculateFuel(1969)).toBe(654);
});
test('For a mass of 100756, the fuel required is 33583.', () => {
  expect(calculateFuel(100756)).toBe(33583);
});

test('individually calculate the fuel needed for the mass of each module (your puzzle input), then add together all the fuel values.',
async () => {
  expect.assertions(1);
  let filename = __dirname+'/day1input.test1.txt';
  await expect(processInputFile(filename)).resolves.toBe(2+2+654+33583);
});

test('What is the sum of the fuel requirements for all of the modules on your spacecraft?',
async () => {
  expect.assertions(1);
  let filename = __dirname+'/day1input.txt';
  await expect(processInputFile(filename)).resolves.toBe(3481005);
});
