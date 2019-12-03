const calculateFuel = require('./day1').calculateFuel;
const calculateFuelRecursive = require('./day1').calculateFuelRecursive;
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

test('A module of mass 14 requires 2 fuel. This fuel requires no further fuel (2 divided by 3 and rounded down is 0, which would call for a negative fuel), so the total fuel required is still just 2.', () => {
  expect(calculateFuelRecursive(14)).toBe(2);
});

test('At first, a module of mass 1969 requires 654 fuel. Then, this fuel requires 216 more fuel (654 / 3 - 2). 216 then requires 70 more fuel, which requires 21 fuel, which requires 5 fuel, which requires no further fuel. So, the total fuel required for a module of mass 1969 is 654 + 216 + 70 + 21 + 5 = 966.', () => {
  expect(calculateFuelRecursive(1969)).toBe(966);
});

test('The fuel required by a module of mass 100756 and its fuel is: 33583 + 11192 + 3728 + 1240 + 411 + 135 + 43 + 12 + 2 = 50346.', () => {
  expect(calculateFuelRecursive(100756)).toBe(50346);
});


test('What is the sum of the fuel requirements for all of the modules on your spacecraft when also taking into account the mass of the added fuel?',
async () => {
  expect.assertions(1);
  let filename = __dirname+'/day1input.txt';
  await expect(processInputFile(filename, true)).resolves.toBe(5218616);
});
