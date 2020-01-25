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

    while (!ratingsAlreadySeen.has(emulator.biodiversityRating)) {
      ratingsAlreadySeen.add(emulator.biodiversityRating);
      emulator.step();
      count += 1;
    }

    expect(emulator.biodiversityRating).toBe(2129920);
  })

  test('First repeat biodiversityRating for puzzle input', async () => {
    const linesAsync = createStreamFromFile(filename);
    const emulator = await BugLife.fromStream(linesAsync);

    const ratingsAlreadySeen = new Set();

    while (!ratingsAlreadySeen.has(emulator.biodiversityRating)) {
      ratingsAlreadySeen.add(emulator.biodiversityRating);
      emulator.step();
    }

    expect(emulator.biodiversityRating).toBe(32505887);
  })


  // For example, consider the same initial state as above:
  // ....#
  // #..#.
  // #.?##
  // ..#..
  // #....

  // The center tile is drawn as ? to indicate the next recursive grid. Call this level 0; 
  // the grid within this one is level 1, and the grid that contains this one is level -1. 
  // Then, after ten minutes, the grid at each level would look like this:

  let depths = {
    [-5]: `
  ..#..
  .#.#.
  ..?.#
  .#.#.
  ..#..
    `,
    [-4]: `
  ...#.
  ...##
  ..?..
  ...##
  ...#.
    `,
    [-3]: `
  #.#..
  .#...
  ..?..
  .#...
  #.#..
    `,
    [-2]: `
  .#.##
  ....#
  ..?.#
  ...##
  .###.
    `,
    [-1]: `
  #..##
  ...##
  ..?..
  ...#.
  .####
  `,
    [0]:`
  .#...
  .#.##
  .#?..
  .....
  .....
  `,
    [1]:`
  .##..
  #..##
  ..?.#
  ##.##
  #####
  `,
    [2]:`
  ###..
  ##.#.
  #.?..
  .#.##
  #.#..
  `,
    [3]:`
  ..###
  .....
  #.?..
  #....
  #...#
  `,
    [4]: `
  .###.
  #..#.
  #.?..
  ##.#.
  .....
  `,
    [5]: `
  ####.
  #..#.
  #.?#.
  ####.
  .....
`
  };
  // In this example, after 10 minutes, a total of 99 bugs are present.

  test('Part 2, Iteration 1', async () => {
    const linesAsync = createStreamFromString(states[0]);
    const emulator = await BugLife.fromStream(linesAsync);

    expect(emulator.lines).toEqual(trimLines(states[0]))

    expect(emulator.linesRecursive.get(0)).toEqual(trimLines(`
    ....#
    #..#.
    #.?##
    ..#..
    #....
    `));
    // The center tile is drawn as ? to indicate the next recursive grid. 
    // Call this level 0; the grid within this one is level 1, and the grid that contains this one is level -1. 

    emulator.stepRecursive();

    // A bug dies (becoming an empty space) unless there is exactly one bug adjacent to it.
    // An empty space becomes infested with a bug if exactly one or two bugs are adjacent to it.
    expect(emulator.linesRecursive.get(-1)).toEqual(trimLines(`
    .....
    ..#..
    ..?#.
    ..#..
    .....
    `)); // 3
    expect(emulator.linesRecursive.get(1)).toEqual(trimLines(`
    ....#
    ....#
    ..?.#
    ....#
    #####
    `)); // 9
     expect(emulator.linesRecursive.get(0)).toEqual(trimLines(`
    #..#.
    ####.
    ##?.#
    ##.##
    .##..
    `)); // 15

    expect(emulator.totalBugs).toEqual(27);
  });
  test('Part 2, Iteration 10', async () => {
    const linesAsync = createStreamFromString(states[0]);
    const emulator = await BugLife.fromStream(linesAsync);

    expect(emulator.lines).toEqual(trimLines(states[0]))

    emulator.stepRecursive();
    emulator.stepRecursive();
    emulator.stepRecursive();
    emulator.stepRecursive();
    emulator.stepRecursive();
    emulator.stepRecursive();
    emulator.stepRecursive();
    emulator.stepRecursive();
    emulator.stepRecursive();
    emulator.stepRecursive();

    expect(emulator.totalBugs).toEqual(99);
    expect(emulator.linesRecursive.get(-5)).toEqual(trimLines(depths[-5]));
    expect(emulator.linesRecursive.get(-4)).toEqual(trimLines(depths[-4]));
    expect(emulator.linesRecursive.get(-3)).toEqual(trimLines(depths[-3]));
    expect(emulator.linesRecursive.get(-2)).toEqual(trimLines(depths[-2]));
    expect(emulator.linesRecursive.get(-1)).toEqual(trimLines(depths[-1]));
    expect(emulator.linesRecursive.get(0)).toEqual(trimLines(depths[0]));
    expect(emulator.linesRecursive.get(1)).toEqual(trimLines(depths[1]));
    expect(emulator.linesRecursive.get(2)).toEqual(trimLines(depths[2]));
    expect(emulator.linesRecursive.get(3)).toEqual(trimLines(depths[3]));
    expect(emulator.linesRecursive.get(4)).toEqual(trimLines(depths[4]));
    expect(emulator.linesRecursive.get(5)).toEqual(trimLines(depths[5]));
  });
})