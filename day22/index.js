const { Shuffler } = require('./cardDeck');
const { createStreamFromFile } = require('../lib/createStream');

const filename = __dirname + '/input.txt';
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
  console.log(chalk.yellowBright(`After shuffling your factory order deck of 10007 cards, what is the position of card 2019?`));
  let t0 = Date.now();

  const linesAsync = createStreamFromFile(filename);
  const shuffler = new Shuffler(10007);
  await shuffler.shuffle(linesAsync);

  let result = shuffler.deck.cards.indexOf(2019);
  
  console.log('What is the position of card 2019?', result, (result === 6129) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}

async function part2() {
  console.log(chalk.yellowBright(`Part 2.`));
  let t0 = Date.now();
  
  let result = -1;
  console.log('What is the result?', result, (result === 1143814750) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}
