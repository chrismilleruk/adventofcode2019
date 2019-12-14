const { createStreamFromFile } = require('../lib/createStream');
const { detectAsteroids, findBestLocation, fireRotatingLaser} = require('./monitoringStation');

const chalk = require('chalk');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    console.log('Find the best location for a new monitoring station.');
    console.log(chalk.yellowBright('How many other asteroids can be detected from that location?'));

    try {
      const asteroids = await detectAsteroids(createStreamFromFile(filename));
      const station = await findBestLocation(asteroids);

      console.log('Best station location', station.coord);
      console.log('Asteroids detected', station.detected, (station.detected === 276) ? '🏆' : '❌');

      const shots = [];
      for (let shot of fireRotatingLaser(asteroids, station)) {
        shots.push(shot);
      }
      let count = shots.length;

      let shot200 = shots[199].coord;
      let shot200Answer = shot200[0] * 100 + shot200[1];
      console.log('200th asteroid vaporised', shot200, shot200Answer, (shot200Answer === 1321) ? '🏆' : '❌');
      console.log('Asteroids vaporised', count);
    } catch (ex) {
      console.error(ex);
    }

  })();
}
