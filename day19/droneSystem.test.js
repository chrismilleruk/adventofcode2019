const { DroneSystem } = require('./droneSystem');
const filename = __dirname + '/input.txt';

describe('Drone System', () => {
  const example1 = `
    #.........
    .#........
    ..##......
    ...###....
    ....###...
    .....####.
    ......####
    ......####
    .......###
    ........##`;
  const example1lines = example1.split('\n').map(l => l.trim()).filter(l => l.length);

  test('example 1', async () => {
    const droneSystem = new DroneSystem(filename);
    await droneSystem.loadTractorBeamTestProgram();

    const zeroZero = await droneSystem.testAt(0, 0);
    expect(zeroZero).toBe(1);

    for await (const panel of droneSystem.testGrid(10, 1))
    {
      const line = example1lines[panel.coord[1]];
      const expected = line[panel.coord[0]] === '#' ? 1 : 0;
      expect(panel).toHaveProperty('color', expected);
    }
  })
})
