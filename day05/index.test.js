const {
  loadInputFile,
  executeProgram
} = require('./intCodeComputer');

let filename = __dirname + '/input.txt';

describe('Run Diagnostic', () => {
  test('Input = 1', async () => {

    const buffer = await loadInputFile(filename);

    let inputFn = jest.fn(() => 1);
    let outputFn = jest.fn();

    executeProgram(buffer, inputFn, outputFn);

    expect(inputFn).toHaveBeenCalledTimes(1);
    expect(outputFn).toHaveBeenCalledTimes(10);
    expect(outputFn).lastCalledWith(4601506);
  })
})