const {
  loadOrbitFile,
  getOrbitChecksum,
  shortestDistanceBetweenPlanets
} = require('./orbitComputer');

let filename = __dirname + '/input.txt';

describe('Universal Orbit Map', () => {
  test.skip('What is the total number of direct and indirect orbits in your map data?', async () => {
    const orbitMapData = await loadOrbitFile(filename);

    let checksum = getOrbitChecksum(orbitMapData);

    expect(checksum).toBe(122782);
  });

  test('What is the minimum number of orbital transfers required to move from the object YOU are orbiting to the object SAN is orbiting?', async () => {
    const orbitMapData = await loadOrbitFile(filename);

    let start = orbitMapData.get('YOU');
    let destination = orbitMapData.get('SAN');
    let distance = shortestDistanceBetweenPlanets(start, destination);

    expect(distance).toBe(271);
  });
});
