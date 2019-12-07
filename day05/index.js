const {
  executeProgram,
  loadInputFile
} = require('./intCodeComputer');
const readline = require('readline-sync');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    const buffer = await loadInputFile(filename);

    function inputFn() {
      let input = readline.question("Diagnostic System ID: ");
      console.log(input);
      return parseInt(input, 10);
    }
    function outputFn(val) {
      console.log(val);
    }

    executeProgram(buffer, inputFn, outputFn);

  })();
}

module.exports = {
};
