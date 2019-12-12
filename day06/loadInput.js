const fs = require('fs');
const { Readable } = require('stream');

async function* chunksToTokens(chunksAsync) {
  let previous = '';
  for await (const chunk of chunksAsync) {
    previous += chunk;
    let eolIndex;
    while ((eolIndex = previous.indexOf('\n')) >= 0) {
      // value excludes the eol
      const value = previous.slice(0, eolIndex).trim();
      if (value.length > 0) {
        yield value;
      }
      previous = previous.slice(eolIndex + 1);
    }
  }
  previous = previous.trim();
  if (previous.length > 0) {
    yield previous;
  }
}

function createStreamFromFile(filename) {
  // This line opens the file as a readable stream
  var readStream = fs.createReadStream(filename,
    { encoding: 'utf8', highWaterMark: 1024 });

  return chunksToTokens(readStream);
}

function createStreamFromString(input) {
  async function* gen() {
    yield input;
  };

  return chunksToTokens(Readable.from(gen()));
}

module.exports = { createStreamFromString, createStreamFromFile };
