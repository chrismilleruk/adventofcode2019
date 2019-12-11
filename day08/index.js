const { createStreamFromFile, layersToStats } = require('./loadInput');
const { flattenLayers } = require('./render');
const readline = require('readline-sync');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    try {
      console.log(1, 'Test Space Image Format File for Corruption');
      console.log(2, 'Render Image');
      let input = readline.question('Select: ');

      if (input === "1") {
        // To make sure the image wasn't corrupted during transmission, the Elves would
        // like you to find the layer that contains the fewest 0 digits. 
        let layerWithFewestZeros = { 0: Number.MAX_VALUE };
        for await (let layer of layersToStats(createStreamFromFile(filename))) {
          if (layer[0] < layerWithFewestZeros[0]) {
            layerWithFewestZeros = layer;
          }
        }
        console.log('Layer with fewest zeros:', layerWithFewestZeros);
        // On that layer, what is the number of 1 digits multiplied by the number of 2 digits?
        console.log('Number of 1 digits multiplied by the number of 2 digits', layerWithFewestZeros[1] * layerWithFewestZeros[2]);
      } else if (input === "2") {
        let rendering = await flattenLayers(createStreamFromFile(filename));

        BgBlack = "\x1b[40m"
        BgRed = "\x1b[41m"
        BgGreen = "\x1b[42m"
        BgYellow = "\x1b[43m"
        BgBlue = "\x1b[44m"
        BgMagenta = "\x1b[45m"
        BgCyan = "\x1b[46m"
        BgWhite = "\x1b[47m"

        while (rendering.length) {
          let row = rendering.splice(0, 25);
          for (const char of row) {
            switch (char) {
              case '0': // black
                process.stdout.write(BgBlack + ' ');
                break;
              case '1': // white
                process.stdout.write(BgWhite + '+');
                break;
              default:
                process.stdout.write(BgYellow + '?');
                break;
            }
          }
          process.stdout.write('\n');
        }
        let rows = rendering.join('').match(/.{1,25}/g);
        for (let char of rendering) {
          console.log(row);
        }
      }
    } catch (ex) {
      console.error(ex);
    }
  })();
}
