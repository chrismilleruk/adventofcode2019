const { createStreamFromString, createStreamFromFile } = require('../lib/createStream');
const { getCoords, detectAsteroids, findBestLocation } = require('./monitoringStation');

const chalk = require('chalk');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    console.log('Find the best location for a new monitoring station.');
    console.log(chalk.yellowBright('How many other asteroids can be detected from that location?'));

    try {
      const coords = await detectAsteroids(createStreamFromFile(filename));
      const best = await findBestLocation(coords);

      console.log('Best location', best.coord, (true) ? '🏆' : '❌');
      console.log('Asteroids detected', best.detected, (true) ? '🏆' : '❌');

    } catch (ex) {
      console.error(ex);
    }

  })();
}
