const fs = require('fs');

async function* valuesToIntegers(valuesAsync) {
  for await (const value of valuesAsync) {
    yield parseInt(value, 10);
  }
}

async function* chunksToValues(chunksAsync) {
  let previous = '';
  for await (const chunk of chunksAsync) {
    previous += chunk;
    let eolIndex;
    while ((eolIndex = previous.indexOf(',')) >= 0) {
      // value excludes the comma
      const value = previous.slice(0, eolIndex);
      yield value;
      previous = previous.slice(eolIndex + 1);
    }
  }
  if (previous.length > 0) {
    yield previous;
  }
}

async function loadInputFile(filename) {
  // This line opens the file as a readable stream
  var readStream = fs.createReadStream(filename,
    { encoding: 'utf8', highWaterMark: 1024 });

  let result = [];
  for await (const integer of valuesToIntegers(chunksToValues(readStream))) {
    result.push(integer)
  }
  // let valuesAsync = await chunksToValues(readStream);
  // let integersAsync = await valuesToIntegers(valuesAsync);
  // let result = await integersAsync;/*?*/
  return result;
}

module.exports = {
  loadInputFile
};