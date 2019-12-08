const { loadInputFile } = require('../day05/loadBuffer');
const { findMaxAmplifySequence } = require('./amplifier');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    try {
      const buffer = await loadInputFile(filename);
      const result = findMaxAmplifySequence(buffer);
      console.log(result.max);
      console.log(result.sequence);
    } catch (ex) {
      console.error(ex);
    }
  })();
}

module.exports = {
};
