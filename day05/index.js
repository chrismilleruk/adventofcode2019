const { executeProgram } = require('../lib/intCodeComputer');
const { loadIntcodeFile } = require('../lib/loadIntcode');
const readline = require('readline-sync');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    const buffer = await loadIntcodeFile(filename);

    console.log('Part 1: After providing 1, what diagnostic code does the program produce?');
    console.log('Part 2: What is the diagnostic code for system ID 5?');

    function inputFn() {
      let input = readline.question("Diagnostic System ID: ");
      return parseInt(input, 10);
    }
    function outputFn(val) {
      console.log(val);
    }

    try {
      await executeProgram(buffer, inputFn, outputFn);
    } catch (ex) {
      console.error(ex);
    }

  })();
}

module.exports = {
};
