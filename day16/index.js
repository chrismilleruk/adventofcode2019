const { FFT } = require('./fft')
const { createStreamFromFile } = require('../lib/createStream');

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
        if (phase < 10 || phase % 10 === 0) console.log(phase, fft.first8digits, Date.now() - t1, 'ms')
      }
      
      console.log('First eight digits after 100 phases', fft.first8digits, (fft.first8digits === '19944447') ? '🏆' : '❌');
      console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));

      // Part 2
      t0 = Date.now();
      const input2 = Array(10000).fill(line.value).join('');
      console.log(chalk.green(`input repeated 10,000 times is ${input2.length} digits long.`))

      const fft2 = new FFT(input2, input2.slice(0, 7));
      console.log(chalk.green(`FFT initialised.`))
      console.log(chalk.gray(fft2.first7digits), chalk.gray(fft2.offset), chalk.gray(fft2.digitsAtOffset))
      for (phase = 1; phase <= numberOfPhases; phase += 1){
        let t1 = Date.now();
        fft2.step();
        if (phase < 10 || phase % 10 === 0) console.log(phase, fft2.digitsAtOffset, Date.now() - t1, 'ms')
      }

      console.log('First eight digits after 100 phases', fft.first8digits, (fft.first8digits === '19944447') ? '🏆' : '❌');
      console.log('Checksum digits after 100 phases', fft.digitsAtOffset, (fft.digitsAtOffset === '19944447') ? '🏆' : '❌');
      console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));

    } catch (ex) {
      console.error(ex);
    }

  })();
}
