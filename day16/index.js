const { FFT } = require('./fft')
const { createStreamFromFile } = require('../lib/createStream');
// const { preparePlotArea, plotPanelAsBlock } = require('../lib/render');

const chalk = require('chalk');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    console.log(chalk.yellowBright(`After 100 phases of FFT, what are the first eight digits in the final output list?`));

    try {
      const stream = createStreamFromFile(filename)
      const line = await stream.next();
      const input = line.value;

      let numberOfPhases = 100;
      let phase = 0;
      let t0 = Date.now();

      const fft = new FFT(input);
      for (phase = 1; phase <= numberOfPhases; phase += 1){
        let t1 = Date.now();
        fft.step();
        console.log(phase, fft.first8digits, Date.now() - t1, 'ms')
      }
      
      console.log('First eight digits after 100 phases', fft.first8digits, (fft.first8digits === '19944447') ? '🏆' : '❌');
      console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
    } catch (ex) {
      console.error(ex);
    }

  })();
}
