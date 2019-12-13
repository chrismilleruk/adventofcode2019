const { loadIntcodeFile } = require('../lib/loadIntcode');
const { executeProgramAsGenerator } = require('../lib/intCodeComputer');
const readline = require('readline-sync');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    const buffer = await loadIntcodeFile(filename);

    console.log('Mode 1. What BOOST keycode does it produce?');
    console.log('Mode 2. Sensor boost mode. What are the coordinates of the distress signal?');

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
