const fs = require('fs');
const { Readable } = require('stream');

async function* chunksToLayers(chunksAsync, width, height) {
  let previous = '';
  for await (const chunk of chunksAsync) {
    previous += chunk.trim();
    let layerSize = width * height;
    while (layerSize <= previous.length) {
      // value excludes the eol
      const value = previous.slice(0, layerSize).trim();
      if (value.length > 0) {
        yield value;
      }
      previous = previous.slice(layerSize).trim();
    }
  }
  previous = previous.trim();
  if (previous.length > 0) {
    yield previous;
  }
}

function createStreamFromFile(filename, width = 25, height = 6) {
  // This line opens the file as a readable stream
  var readStream = fs.createReadStream(filename,
    { encoding: 'utf8', highWaterMark: 1024 });

  return chunksToLayers(readStream, width, height);
}

function createStreamFromString(input, width = 25, height = 6) {
  async function* gen() {
    yield input;
  };

  return chunksToLayers(Readable.from(gen()), width, height);
}

async function* layersToStats(layersAsync) {
  for await (const layer of layersAsync) {
    let stats = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
    for (const char of layer) {
      stats[char] += 1;
    }
    yield stats;
  }
}

module.exports = { createStreamFromString, createStreamFromFile, layersToStats };
