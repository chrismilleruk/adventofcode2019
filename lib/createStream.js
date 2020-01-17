const fs = require('fs');
const { Readable } = require('stream');

async function* charCodeToChar(charCodeAsync) {
  for await (const charCode of charCodeAsync) {
    if (charCode <= 0xFFFF) {
      yield String.fromCharCode(charCode);
    } else {
      // If number is out of range, convert to string.
      yield String(charCode);
    }
  }
}

async function* chunksToLines(chunksAsync, trimWhitespace = true, trimEmptyLines = true) {
  let previous = '';
  for await (const chunk of chunksAsync) {
    previous += chunk;
    let eolIndex;
    while ((eolIndex = previous.indexOf('\n')) >= 0) {
      const line = previous.slice(0, eolIndex);
      // value excludes the eol
      const value = trimWhitespace ? line.trim() : line;
      if (!trimEmptyLines || value.length > 0) {
        yield value;
      }
      previous = previous.slice(eolIndex + 1);
    }
  }
  if (trimWhitespace) previous = previous.trim();
  if (!trimEmptyLines || previous.length > 0) {
    yield previous;
  }
}

function createStreamFromFile(filename, trimWhitespace = true) {
  // This line opens the file as a readable stream
  var readStream = fs.createReadStream(filename,
    { encoding: 'utf8', highWaterMark: 1024 });

  return chunksToLines(readStream, trimWhitespace);
}

function createStreamFromString(input, trimWhitespace = true) {
  async function* gen() {
    yield input;
  }

  return chunksToLines(Readable.from(gen()), trimWhitespace);
}

module.exports = { createStreamFromString, createStreamFromFile, chunksToLines, charCodeToChar };
