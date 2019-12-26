const { DroneSystem } = require('./droneSystem');
const filename = __dirname + '/input.txt';

describe('Drone System', () => {
  const example1 = `
    #.........
    ..........
    ..........
    ..........
    ..........
    ....#.....
    .....#....
    ......#...
    .......#..
    .......##.`;
  const example1lines = example1.split('\n').map(l => l.trim()).filter(l => l.length);

  test('example 1', async () => {
    const droneSystem = new DroneSystem(filename);
    await droneSystem.loadTractorBeamTestProgram();

    let output = await droneSystem.testAt(0, 0);
    expect(output).toBe(1);

    output = await droneSystem.testAt(4, 5);
    expect(output).toBe(1);

    output = await droneSystem.testAt(8, 9);
    expect(output).toBe(1);

    for await (const panel of droneSystem.testGrid(10, 1))
    {
      const line = example1lines[panel.coord[1]];
      const expected = line[panel.coord[0]] === '#' ? 1 : 0;
      expect(panel).toHaveProperty('color', expected);
    }
  })

  test('find space for', async () => {
    const droneSystem = new DroneSystem(filename);
    await droneSystem.loadTractorBeamTestProgram();

    let coord;
    coord = await droneSystem.findSpaceFor(1, 1, 10);
    expect(coord).toEqual([4, 5]);

    coord = await droneSystem.findSpaceFor(2, 2, 15);
    expect(coord).toEqual([10, 12]);

    // ┃▘                           ┃
    // ┃                            ┃
    // ┃  ▖                         ┃
    // ┃  ▝▖                        ┃
    // ┃   ▐▖                       ┃
    // ┃    ▜▖                      ┃
    // ┃     █▖                     ┃
    // ┃     ▝▙                     ┃
  })
})
