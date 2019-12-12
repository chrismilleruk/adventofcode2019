const { loadInputFile } = require('../day05/loadBuffer');
const { executeProgramAsGenerator } = require('./intCodeComputer');

let filename = __dirname + '/input.txt';

describe('Day 9: Sensor Boost', () => {
  test('Mode 1. What BOOST keycode does it produce?', async () => {

    const buffer = await loadInputFile(filename);
    const inputFn = () => 1;
    let outputBuffer = [];
    for await (const value of executeProgramAsGenerator(buffer, inputFn)) {
      outputBuffer.push(value);
    }

    expect(outputBuffer).toEqual([3280416268]);
  });

  test.skip('Mode 2. Sensor boost mode. What are the coordinates of the distress signal?', async () => {

    const buffer = await loadInputFile(filename);
    const inputFn = () => 2;
    let outputBuffer = [];
    for await (const value of executeProgramAsGenerator(buffer, inputFn)) {
      outputBuffer.push(value);
    }

    expect(outputBuffer).toEqual([80210]);
  });
});
