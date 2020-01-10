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
  console.log(chalk.yellowBright(`After shuffling your new, giant, factory order deck that many times, what number is on the card that ends up in position 2020?`));
  let t0 = Date.now();

  // a single, giant, brand new, factory order deck of 119315717514047 space cards
  // Shuffle the deck 101741582076661 times in a row.
  
  let result = -1;
  console.log('What number is on the card that ends up in position 2020?', result, (result === 0) ? '🏆' : '❌');
  console.log(chalk.grey(`Time taken ${Date.now() - t0}ms`));
}
