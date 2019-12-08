const { loadInputFile } = require('../day05/loadBuffer');
const { findMaxAmplifySequence } = require('./amplifier');

let filename = __dirname + '/input.txt';

describe('Amplification Circuit', () => {
  test('What is the highest signal that can be sent to the thrusters?', async () => {

    const buffer = await loadInputFile(filename);
    const result = await findMaxAmplifySequence(buffer);
    expect(result.max).toBe(212460);
    expect(result.sequence).toStrictEqual([ 3, 2, 0, 1, 4 ]);

  });
});
