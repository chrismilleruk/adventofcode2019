const {
  loadInputFile,
  getOrbitChecksum
} = require('./orbitComputer');

let filename = __dirname + '/input.txt';

describe('Universal Orbit Map', () => {
  test('What is the total number of direct and indirect orbits in your map data?', async () => {
    const orbitMapData = await loadInputFile(filename);

    let checksum = getOrbitChecksum(orbitMapData);

    expect(checksum).toBe(122782);
  });
});