const { loadIntcodeFile } = require('../lib/loadIntcode');
const { paintingRobot } = require('./paintingRobot');

let filename = __dirname + '/input.txt';

describe('Day 11: Space Police', () => {
  test.skip('How many panels does it paint at least once?', async () => {
    const program = await loadIntcodeFile(filename);
    const panels = await paintingRobot(program);

    let paintedPanels = [...panels.values()].filter(panel => panel.coats > 0);
    expect(paintedPanels.length).toBe(2418);
  });
});
