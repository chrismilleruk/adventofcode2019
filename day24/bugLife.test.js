const { BugLife } = require('./bugLife');
const { createStreamFromFile, createStreamFromString } = require('../lib/createStream');
const filename = __dirname + '/input.txt';


function trimLines(str) {
  return str.split('\n').map(s => s.trim()).filter(s => s > '').join('\n');
}

describe('Bug Life', () => {
  test('Biodiversity Rating', async () => {
    const linesAsync = createStreamFromString(`
    .....
    .....
    .....
    #....
    .#...
    `);
    const emulator = await BugLife.fromStream(linesAsync);

    expect(emulator.lineValues).toEqual([0, 0, 0, 1, 2]);
    expect(emulator.biodiversityRating).toBe(2129920);
  })

  const states = [
    `
    ....#
    #..#.
    #..##
    ..#..
    #....
    `,
    // After 1 minute:
    `
    #..#.
    ####.
    ###.#
    ##.##
    .##..
    `,
    // After 2 minutes:
    `
    #####
    ....#
    ....#
    ...#.
    #.###
    `,
    // After 3 minutes:
    `
    #....
    ####.
    ...##
    #.##.
    .##.#
    `,
    // After 4 minutes:
    `
    ####.
    ....#
    ##..#
    .....
    ##...
    `
  ];

  test('Iteration 1', async () => {
    const linesAsync = createStreamFromString(states[0]);
    const emulator = await BugLife.fromStream(linesAsync);

    expect(emulator.lines).toEqual(trimLines(states[0]))

    emulator.step();
    expect(emulator.lines).toEqual(trimLines(states[1]))
  });

  test('Iteration 2-4', async () => {
    const linesAsync = createStreamFromString(states[0]);
    const emulator = await BugLife.fromStream(linesAsync);

    expect(emulator.lines).toEqual(trimLines(states[0]))

    emulator.step();
    expect(emulator.lines).toEqual(trimLines(states[1]));

    emulator.step();
    expect(emulator.lines).toEqual(trimLines(states[2]));

    emulator.step();
    expect(emulator.lines).toEqual(trimLines(states[3]));

    emulator.step();
    expect(emulator.lines).toEqual(trimLines(states[4]));
  });

  test('First repeat biodiversityRating is 2129920', async () => {
    const linesAsync = createStreamFromString(states[0]);
    const emulator = await BugLife.fromStream(linesAsync);

    let count = 0;

    const ratingsAlreadySeen = new Set();

    while (!ratingsAlreadySeen.has(emulator.biodiversityRating) ) {
      ratingsAlreadySeen.add(emulator.biodiversityRating);
      emulator.step();
      count += 1;
    }

    count;
    expect(emulator.biodiversityRating).toBe(2129920);
  })

  test('First repeat biodiversityRating for puzzle input', async () => {
    const linesAsync = createStreamFromFile(filename);
    const emulator = await BugLife.fromStream(linesAsync);

    const ratingsAlreadySeen = new Set();

    while (!ratingsAlreadySeen.has(emulator.biodiversityRating) ) {
      ratingsAlreadySeen.add(emulator.biodiversityRating);
      emulator.step();
    }

    expect(emulator.biodiversityRating).toBe(32505887);
  })

})