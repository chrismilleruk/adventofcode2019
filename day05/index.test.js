const { executeProgram } = require('../lib/intCodeComputer');
const { loadIntcodeFile } = require('../lib/loadIntcode');

let filename = __dirname + '/input.txt';

describe('Run Diagnostic', () => {
  test.skip('After providing 1, what diagnostic code does the program produce?', async () => {

    const buffer = await loadIntcodeFile(filename);

    let inputFn = jest.fn(() => 1);
    let outputFn = jest.fn();

    await executeProgram(buffer, inputFn, outputFn);

    expect(inputFn).toHaveBeenCalledTimes(1);
    expect(outputFn).toHaveBeenCalledTimes(10);
    expect(outputFn).lastCalledWith(4601506);
  });

  test('What is the diagnostic code for system ID 5?', async () => {
    // This time, when the TEST diagnostic program runs its input instruction 
    // to get the ID of the system to test, provide it 5, the ID for the ship's 
    // thermal radiator controller. This diagnostic test suite only outputs one number, 
    // the diagnostic code.

    const buffer = await loadIntcodeFile(filename);

    let inputFn = jest.fn(() => 5);
    let outputFn = jest.fn();

    await executeProgram(buffer, inputFn, outputFn);

    expect(inputFn).toHaveBeenCalledTimes(1);
    expect(outputFn).toHaveBeenCalledTimes(1);
    expect(outputFn).lastCalledWith(5525561);
  })
});
