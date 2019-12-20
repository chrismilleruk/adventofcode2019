const { createStreamFromFile, layersToStats } = require('./loadInput');
const { flattenLayers } = require('./render');
const readline = require('readline-sync');
const chalk = require('chalk');

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

        while (rendering.length) {
          let row = rendering.splice(0, 25);
          for (const char of row) {
            switch (char) {
              case '0': // black
                process.stdout.write(chalk.bgBlack.grey('·'));
                break;
              case '1': // white
                process.stdout.write(chalk.bgBlueBright.black('·'));
                break;
              default:
                process.stdout.write(chalk.bgYellow('?'));
                break;
            }
          }
          process.stdout.write('\n');
        }
      }
    } catch (ex) {
      console.error(ex);
    }
  })();
}
