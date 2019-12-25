const { loadIntcodeFile } = require('../lib/loadIntcode');
const { VacuumRobot, CameraView } = require('./vacuumRobot');
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

  const example2 = `
  #######...#####
  #.....#...#...#
  #.....#...#...#
  ......#...#...#
  ......#...###.#
  ......#.....#.#
  ^########...#.#
  ......#.#...#.#
  ......#########
  ........#...#..
  ....#########..
  ....#...#......
  ....#...#......
  ....#...#......
  ....#####......`;

  test('Can get intersections from example camera feed', async () => {
    // Running the ASCII program on your Intcode computer will provide the current view of the scaffolds. 
    // This is output, purely coincidentally, as ASCII code: 35 means #, 46 means ., 10 starts a new line 
    // of output below the current one, and so on. (Within a line, characters are drawn left-to-right.)
    const linesAsync = createStreamFromString(example1);
    // let { intersections } = await getIntersectionsInCameraOutput(linesAsync);
    let view = await CameraView.fromLines(linesAsync);
    let intersections = view.intersections;

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

    expect(intersections).toHaveLength(4)
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
    // let { alignmentSum } = await getIntersectionsInCameraOutput(linesAsync);
    let view = await CameraView.fromLines(linesAsync);
    let alignmentSum = view.alignmentSum;

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

  test('Can get corners from example camera feed', async () => {
    const linesAsync = createStreamFromString(example1);
    // let { corners } = await getIntersectionsInCameraOutput(linesAsync);
    let view = await CameraView.fromLines(linesAsync);
    let corners = view.corners;

    // Here, the corners from the above image are marked C:

    // ..C..........
    // ..#..........
    // C#####C...C#C
    // #.#...#...#.#
    // C###########C
    // ..#...#...#..
    // ..C###C...C..

    expect([...corners]).toHaveLength(10)
    expect(corners.has('2,0')).toBeTruthy()
    expect(corners.has('0,2')).toBeTruthy()
    expect(corners.has('6,2')).toBeTruthy()
    expect(corners.has('10,2')).toBeTruthy()
    expect(corners.has('12,2')).toBeTruthy()
    expect(corners.has('0,4')).toBeTruthy()
    expect(corners.has('12,4')).toBeTruthy()
    expect(corners.has('2,6')).toBeTruthy()
    expect(corners.has('6,6')).toBeTruthy()
    expect(corners.has('10,6')).toBeTruthy()

    expect(corners.get('0,2')).toMatchObject({
      pos: [0, 2],
      dirs: new Set(['E', 'S'])
    })
    expect(corners.get('0,2').E).toMatchObject({
      pos: [6, 2],
      dirs: new Set(['W', 'S'])
    })

    expect(corners.get('2,0')).toMatchObject({
      pos: [2, 0],
      dirs: new Set(['S'])
    })
    expect(corners.get('2,0').S).toMatchObject({
      pos: [2, 6],
      dirs: new Set(['E', 'N'])
    })

  })

  test('Get Instructions', async () => {
    const linesAsync = createStreamFromString(example1);
    let view = await CameraView.fromLines(linesAsync);

    const instructions = view.getInstructions();

    // ..#..........
    // ..#..........
    // ##O####...###
    // #.#...#...#.#
    // ##O###O###O##
    // ..#...#...#..
    // ..#####...^..

    const R = 'R';
    expect(instructions).toEqual([
      4, R, 2, R, 2, R, 12, R, 2, R, 6, R, 4, R, 4, R, 6
    ]);
  })

  test('Get Instructions Example 2', async () => {
    const linesAsync = createStreamFromString(example2);
    let view = await CameraView.fromLines(linesAsync);

    const instructions = view.getInstructions();

    // #######...#####
    // #.....#...#...#
    // #.....#...#...#
    // ......#...#...#
    // ......#...###.#
    // ......#.....#.#
    // ^########...#.#
    // ......#.#...#.#
    // ......#########
    // ........#...#..
    // ....#########..
    // ....#...#......
    // ....#...#......
    // ....#...#......
    // ....#####......

    const R = 'R', L = 'L';
    expect(instructions).toEqual([
      R, 8, R, 8, R, 4, R, 4, R, 8, L, 6, L, 2, R, 4, R, 4, R, 8, R, 8, R, 8, L, 6, L, 2
    ]);
  })
  
  test('Example 2 Split Instructions', async () => {
    const R = 'R', L = 'L';
    const instructions = [
      R, 8, R, 8, R, 4, R, 4, R, 8, L, 6, L, 2, R, 4, R, 4, R, 8, R, 8, R, 8, L, 6, L, 2
    ];

    const splits = CameraView.splitInstructions(instructions);

    expect(splits[0]).toMatch(/^([ABC],?)+$/); // A,B,C,B,A,C
    for (let i = 1; i < splits.length; i += 1) {
      expect(splits[i].length).toBeLessThanOrEqual(20);
      expect(splits[i]).toMatch(/^([RL],\d+,?)+$/); // R,4,L,12,R,8
    }
  })


  test('Puzzle Input Split Instructions', async () => {
    const instructions = [
      'L', 10, 'L', 8, 'R', 8, 'L', 8, 'R', 6,  'L', 10,
      'L', 8,  'R', 8, 'L', 8, 'R', 6, 'R', 6,  'R', 8,
      'R', 8,  'R', 6, 'R', 6, 'L', 8, 'L', 10, 'R', 6,
      'R', 8,  'R', 8, 'R', 6, 'R', 6, 'L', 8,  'L', 10,
      'R', 6,  'R', 8, 'R', 8, 'R', 6, 'R', 6,  'L', 8,
      'L', 10, 'R', 6, 'R', 8, 'R', 8, 'L', 10, 'L', 8,
      'R', 8,  'L', 8, 'R', 6
    ];

    const splits = CameraView.splitInstructions(instructions);
    
    // The main routine may only call the movement functions: A, B, or C.
    expect(splits[0]).toMatch(/^([ABC],?)+$/); // A,B,C,B,A,C
    expect(splits.length).toBeLessThanOrEqual(4);
    expect(splits[0].length).toBeLessThanOrEqual(20);
    for (let i = 1; i < splits.length; i += 1) {
      expect(splits[i].length).toBeLessThanOrEqual(20);
      expect(splits[i]).toMatch(/^([RL],\d+,?)+$/); // R,4,L,12,R,8
    }
  })

  

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Can load camera feed from puzzle input', async () => {
    const program = await loadIntcodeFile(filename);
    expect(program.slice(0, 10)).toEqual([1, 330, 331, 332, 109, 4364, 1102, 1182, 1, 15])

    // Running the ASCII program on your Intcode computer will provide the current view of the scaffolds. 
    // This is output, purely coincidentally, as ASCII code: 35 means #, 46 means ., 10 starts a new line 
    // of output below the current one, and so on. (Within a line, characters are drawn left-to-right.)
    const robot = new VacuumRobot(program);
    const alignmentSum = await robot.getCheckSum();

    expect(alignmentSum).toBe(10064)
  })

  test('Can wake up robot', async () => {
    const program = await loadIntcodeFile(filename);
    const robot = new VacuumRobot(program);
    const instructions = [
      'L', 10, 'L', 8, 'R', 8, 'L', 8, 'R', 6,  'L', 10,
      'L', 8,  'R', 8, 'L', 8, 'R', 6, 'R', 6,  'R', 8,
      'R', 8,  'R', 6, 'R', 6, 'L', 8, 'L', 10, 'R', 6,
      'R', 8,  'R', 8, 'R', 6, 'R', 6, 'L', 8,  'L', 10,
      'R', 6,  'R', 8, 'R', 8, 'R', 6, 'R', 6,  'L', 8,
      'L', 10, 'R', 6, 'R', 8, 'R', 8, 'L', 10, 'L', 8,
      'R', 8,  'L', 8, 'R', 6
    ];
    const splits = CameraView.splitInstructions(instructions);

    const mainFunction = splits.shift();
    robot.wakeUp();
    robot.appendInputBuffer(mainFunction)
    robot.appendInputBuffer(splits.join('\n'))
    robot.appendInputBuffer('n')

    expect(robot._inputBuffer).toBe(
`A,A,B,C,B,C,B,C,B,A
L,10,L,8,R,8,L,8,R,6
R,6,R,8,R,8
R,6,R,6,L,8,L,10
n
`);
  })
})
