const { CardDeck, Shuffler } = require('./cardDeck')
const { createStreamFromString, createStreamFromFile } = require('../lib/createStream');
const filename = __dirname + '/input.txt';

describe('Slam Shuffle', () => {
  test('New pack', () => {
    let deck = new CardDeck(10);
    expect(deck.cards).toHaveLength(10);
    expect(deck.cards).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  })

  test('Deal into new stack', () => {
    let deck = new CardDeck(10);

    deck.dealIntoNewStack();

    expect(deck.cards).toHaveLength(10);
    expect(deck.cards).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
  })

  test('Deal with increment 3', () => {
    let deck = new CardDeck(10);

    deck.dealWithIncrement(3);

    expect(deck.cards).toHaveLength(10);
    expect(deck.cards).toEqual([0, 7, 4, 1, 8, 5, 2, 9, 6, 3]);
  })

  test('Deal with increment 7', () => {
    let deck = new CardDeck(10);

    deck.dealWithIncrement(7);

    expect(deck.cards).toHaveLength(10);
    expect(deck.cards).toEqual([0, 3, 6, 9, 2, 5, 8, 1, 4, 7]);
  })

  test('Deal with increment 9', () => {
    let deck = new CardDeck(10);

    deck.dealWithIncrement(9);

    expect(deck.cards).toHaveLength(10);
    expect(deck.cards).toEqual([0, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  })

  test('Cut 3', () => {
    let deck = new CardDeck(10);

    deck.cut(3);

    expect(deck.cards).toHaveLength(10);
    expect(deck.cards).toEqual([3, 4, 5, 6, 7, 8, 9, 0, 1, 2]);
  })

  test('Cut -4', () => {
    let deck = new CardDeck(10);

    deck.cut(-4);

    expect(deck.cards).toHaveLength(10);
    expect(deck.cards).toEqual([6, 7, 8, 9, 0, 1, 2, 3, 4, 5]);
  })

  test('Shuffler example 1', async () => {
    // deal with increment 7
    // deal into new stack
    // deal into new stack
    // Result: 0 3 6 9 2 5 8 1 4 7
    const linesAsync = createStreamFromString(`
    deal with increment 7
    deal into new stack
    deal into new stack
    `);
    const shuffler = new Shuffler(10);
    let i = shuffler.shuffleIterator(linesAsync);
    i;
    await shuffler.shuffle(linesAsync);
    expect(shuffler.deck.cards).toEqual([0, 3, 6, 9, 2, 5, 8, 1, 4, 7])
  })

  test('Shuffler example 2', async () => {
    // cut 6
    // deal with increment 7
    // deal into new stack
    // Result: 3 0 7 4 1 8 5 2 9 6
    const linesAsync = createStreamFromString(`
    cut 6
    deal with increment 7
    deal into new stack
    `);
    const shuffler = new Shuffler(10);
    await shuffler.shuffle(linesAsync);
    expect(shuffler.deck.cards).toEqual([3, 0, 7, 4, 1, 8, 5, 2, 9, 6])
  })

  test('Shuffler example 3', async () => {
    // deal with increment 7
    // deal with increment 9
    // cut -2
    // Result: 6 3 0 7 4 1 8 5 2 9
    const linesAsync = createStreamFromString(`
    deal with increment 7
    deal with increment 9
    cut -2
    `);
    const shuffler = new Shuffler(10);
    await shuffler.shuffle(linesAsync);
    expect(shuffler.deck.cards).toEqual([6, 3, 0, 7, 4, 1, 8, 5, 2, 9])
  })

  test('Shuffler example 4', async () => {
    // deal into new stack
    // cut -2
    // deal with increment 7
    // cut 8
    // cut -4
    // deal with increment 7
    // cut 3
    // deal with increment 9
    // deal with increment 3
    // cut -1
    // Result: 9 2 5 8 1 4 7 0 3 6
    const linesAsync = createStreamFromString(`
    deal into new stack
    cut -2
    deal with increment 7
    cut 8
    cut -4
    deal with increment 7
    cut 3
    deal with increment 9
    deal with increment 3
    cut -1
    `);
    const shuffler = new Shuffler(10);
    await shuffler.shuffle(linesAsync);
    expect(shuffler.deck.cards).toEqual([9, 2, 5, 8, 1, 4, 7, 0, 3, 6])
  })

  test('Shuffler puzzle input', async () => {
    const linesAsync = createStreamFromFile(filename);
    const shuffler = new Shuffler(10007);
    await shuffler.shuffle(linesAsync);
    expect(shuffler.deck.cards.indexOf(2019)).toEqual(6129)
  })
})