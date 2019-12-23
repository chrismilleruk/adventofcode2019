const { loadIntcodeFile } = require('../lib/loadIntcode');
const { getIntersectionsInCameraOutput, VacuumRobot } = require('./vacuumRobot');
const { createStreamFromString } = require('../lib/createStream')

const filename = __dirname + '/input.txt';


describe('Camera Feed', () => {
  const example1 = `
  ..#..........
  ..#..........
  #######...###
  #.#...#...#.#
  #############
  ..#...#...#..
  ..#####...^..`;

  test('Can get intersections from example camera feed', async () => {
    // Running the ASCII program on your Intcode computer will provide the current view of the scaffolds. 
    // This is output, purely coincidentally, as ASCII code: 35 means #, 46 means ., 10 starts a new line 
    // of output below the current one, and so on. (Within a line, characters are drawn left-to-right.)
    const linesAsync = createStreamFromString(example1);
    let { intersections } = await getIntersectionsInCameraOutput(linesAsync);

    // Here, the intersections from the above image are marked O:

    // ..#..........
    // ..#..........
    // ##O####...###
    // #.#...#...#.#
    // ##O###O###O##
    // ..#...#...#..
    // ..#####...^..
    // For these intersections:

    // The top-left intersection is 2 units from the left of the image and 2 units from the top of the image, so its alignment parameter is 2 * 2 = 4.
    // The bottom-left intersection is 2 units from the left and 4 units from the top, so its alignment parameter is 2 * 4 = 8.
    // The bottom-middle intersection is 6 from the left and 4 from the top, so its alignment parameter is 24.
    // The bottom-right intersection's alignment parameter is 40.
    // To calibrate the cameras, you need the sum of the alignment parameters. In the above example, this is 76.

    expect(intersections.length).toBe(4)
    expect(intersections[0]).toStrictEqual([2, 2])
    expect(intersections[1]).toStrictEqual([2, 4])
    expect(intersections[2]).toStrictEqual([6, 4])
    expect(intersections[3]).toStrictEqual([10, 4])
  })

  test('Can get sum of the alignment parameters from example camera feed', async () => {
    // Running the ASCII program on your Intcode computer will provide the current view of the scaffolds. 
    // This is output, purely coincidentally, as ASCII code: 35 means #, 46 means ., 10 starts a new line 
    // of output below the current one, and so on. (Within a line, characters are drawn left-to-right.)
    const linesAsync = createStreamFromString(example1);
    let { alignmentSum } = await getIntersectionsInCameraOutput(linesAsync);

    // Here, the intersections from the above image are marked O:

    // ..#..........
    // ..#..........
    // ##O####...###
    // #.#...#...#.#
    // ##O###O###O##
    // ..#...#...#..
    // ..#####...^..
    // For these intersections:

    // The top-left intersection is 2 units from the left of the image and 2 units from the top of the image, so its alignment parameter is 2 * 2 = 4.
    // The bottom-left intersection is 2 units from the left and 4 units from the top, so its alignment parameter is 2 * 4 = 8.
    // The bottom-middle intersection is 6 from the left and 4 from the top, so its alignment parameter is 24.
    // The bottom-right intersection's alignment parameter is 40.
    // To calibrate the cameras, you need the sum of the alignment parameters. In the above example, this is 76.

    expect(alignmentSum).toBe(76)
  })

  test('Can load camera feed from puzzle input', async () => {
    const program = await loadIntcodeFile(filename);
    expect(program.slice(0, 10)).toEqual([1, 330, 331, 332, 109, 4364, 1102, 1182, 1, 15])

    // Running the ASCII program on your Intcode computer will provide the current view of the scaffolds. 
    // This is output, purely coincidentally, as ASCII code: 35 means #, 46 means ., 10 starts a new line 
    // of output below the current one, and so on. (Within a line, characters are drawn left-to-right.)
    const robot = new VacuumRobot(program);
    const alignmentSum = await robot.getCheckSum();

    expect(alignmentSum).toBe(10064)
  })
})
