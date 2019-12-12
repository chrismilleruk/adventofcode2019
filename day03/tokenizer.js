const fs = require('fs');
const { Readable } = require('stream');

async function* chunksToTokens(chunksAsync) {
  let previous = '';
  const eolSearch = /[,\n]/g;
  for await (const chunk of chunksAsync) {
    previous += chunk;
    let eolIndex;
    while ((eolIndex = previous.search(eolSearch)) >= 0) {
      // value excludes the eol
      let value = previous.slice(0, eolIndex).trim();
      if (value.length > 0) {
        yield value;
      }

      // return EOL for line breaks
      if (previous[eolIndex] == '\n') {
        yield "EOL";
      }

      previous = previous.slice(eolIndex + 1);
    }
  }
  // final value
  previous = previous.trim();
  if (previous.length > 0) {
    yield previous;
  }

  // return EOL at EOF
  yield "EOL";
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
