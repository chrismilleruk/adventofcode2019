const { SpringDroid } = require('./springDroid');
const { preparePlotArea, plotPanelAsBlock } = require('../lib/render');

const filename = __dirname + '/input.txt';
const readlineSync = require('readline-sync')
const chalk = require('chalk');

if (require.main === module) {
  (async () => {
    try {
      await part1();
      await part2();

    } catch (ex) {
      console.error(ex);
    }
  })();
}

async function part1() {
  console.log(chalk.yellowBright(`Program the springdroid with logic that allows it to survey the hull without falling into space.`));
  let t0 = Date.now();

  let program = `
  NOT C T
  OR T J
  NOT A T
  OR T J
  AND D J
  `;
  const springDroid = new SpringDroid(filename);
  await springDroid.loadSpringScript(program);
  await springDroid.walk();

  for (const line of springDroid.log.split('\n')) {
    if (line.startsWith('>')) {
      console.log(chalk.green(line));
    } else {
      console.log(chalk.gray(line));
    }
  }

  let hullDamage = springDroid.result;
  console.log('What amount of hull damage does it report?', hullDamage, (hullDamage === 19360288) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}

async function part2() {
  console.log(chalk.yellowBright(`Successfully survey the rest of the hull by ending your program with RUN.`));
  let t0 = Date.now();
  
  let program = `
  NOT C T
  OR T J
  NOT A T
  OR T J
  AND D J
  `;
  const springDroid = new SpringDroid(filename);
  await springDroid.loadSpringScript(program);
  await springDroid.run();

  for (const line of springDroid.log.split('\n')) {
    if (line.startsWith('>')) {
      console.log(chalk.green(line));
    } else {
      console.log(chalk.gray(line));
    }
  }

  let hullDamage = springDroid.result;
  console.log('What amount of hull damage does it report?', hullDamage, (hullDamage === 19360288) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}
