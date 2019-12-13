const { executeProgram } = require('../lib/intCodeComputer');
const { loadInputFile } = require('../lib/loadBuffer');
const readline = require('readline-sync');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    const buffer = await loadInputFile(filename);

    function inputFn() {
      let input = readline.question("Diagnostic System ID: ");
      return parseInt(input, 10);
    }
    function outputFn(val) {
      console.log(val);
    }

    try {
      executeProgram(buffer, inputFn, outputFn);
    } catch (ex) {
      console.error(ex);
    }

  })();
}

module.exports = {
};
