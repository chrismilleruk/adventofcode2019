const { configOptions, getChoice } = require('./examples');
const { NanoFactory } = require('./nanoFactory');

const chalk = require('chalk');

const filename = __dirname + '/input.txt';


if (require.main === module) {
  (async () => {
    console.log('Perhaps your ship\'s Inter-Stellar Refinery Union brand nanofactory can turn these raw materials into fuel.');
    console.log(chalk.yellowBright('What is the minimum amount of ORE required to produce exactly 1 FUEL?'));
    console.log(chalk.yellowBright('Given 1 trillion ORE, what is the maximum amount of FUEL you can produce?'));

    try {
      const config = await getChoice(configOptions);
      const linesAsync = config.createStream();
      const factory = await NanoFactory.parseStream(linesAsync);

      const t0 = Date.now();
  
      factory.produceFuel(1);
      
      console.log('Ore used to produce 1 fuel', factory.oreUsed, (factory.oreUsed === config.oneFuelOreCost) ? '🏆' : '❌');
      console.log(chalk.grey('Time taken'), Date.now() - t0, chalk.yellow('ms'));
      console.log(chalk.grey('Waste'), factory.waste);

      console.log(chalk.grey('...producing remaining fuel...'));
      factory.produceAllFuel();

      console.log('Total fuel produced', factory.fuelProduced, (factory.fuelProduced === config.trillionOreFuel) ? '🏆' : '❌');
      console.log(chalk.grey('Time taken'), Date.now() - t0, chalk.yellow('ms'));
      console.log(chalk.grey('Total ore used'), factory.oreUsed);
      console.log(chalk.grey('Total waste'), factory.waste);
    } catch (ex) {
      console.error(ex);
    }

  })();
}
