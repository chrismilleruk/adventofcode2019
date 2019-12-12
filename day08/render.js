const { createStreamFromFile, layersToStats } = require('./loadInput');

const filename = __dirname + '/input.txt';

async function flattenLayers(layerAsync) {
  let rendered = [];
  for await (let layer of layerAsync) {
    // First layer is rendered in full.
    if (rendered.length === 0) {
      rendered = [...layer];
      continue;
    }

    // Subsequent layers only render pixels if transparent (2)
    rendered.map((pixel, i) => {
      if (pixel == 2) {
        rendered[i] = layer[i];
      }
    });
  }

  return rendered;
}

module.exports = { flattenLayers };
