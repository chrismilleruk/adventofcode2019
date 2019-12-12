const { loadInputFile } = require('../day05/loadBuffer');
const { executeProgramAsGenerator } = require('./intCodeComputer');
const readline = require('readline-sync');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    const buffer = await loadInputFile(filename);

    function inputFn() {
      let input = readline.question("Mode ID: ");
      return parseInt(input, 10);
    }

    try {
      for await (const output of executeProgramAsGenerator(buffer, inputFn)) {
        console.log(output);
      }
    } catch (ex) {
      console.error(ex);
    }

  })();
}

module.exports = {
};
