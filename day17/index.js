const { loadIntcodeFile } = require('../lib/loadIntcode');
const { VacuumRobot } = require('./vacuumRobot');

const chalk = require('chalk');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    console.log(chalk.yellowBright(`What is the sum of the alignment parameters for the scaffold intersections?`));

    try {
      const program = await loadIntcodeFile(filename);
      const robot = new VacuumRobot(program);

      let alignmentSum = await robot.getCheckSum();

      console.log('Sum of the alignment parameters', alignmentSum, (alignmentSum === 10064) ? '🏆' : '❌');
    } catch (ex) {
      console.error(ex);
    }

  })();
}
