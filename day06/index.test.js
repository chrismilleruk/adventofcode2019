const {
  loadInputFile,
  getOrbitChecksum,
  shortestDistanceBetweenPlanets
} = require('./orbitComputer');

let filename = __dirname + '/input.txt';

describe('Universal Orbit Map', () => {
  test('What is the total number of direct and indirect orbits in your map data?', async () => {
    const orbitMapData = await loadInputFile(filename);

    let checksum = getOrbitChecksum(orbitMapData);

    expect(checksum).toBe(122782);
  });

  test('What is the total number of direct and indirect orbits in your map data?', async () => {
    const orbitMapData = await loadInputFile(filename);

    let start = orbitMapData.get('YOU');
    let destination = orbitMapData.get('SAN');
    let distance = shortestDistanceBetweenPlanets(start, destination);
    
    expect(distance).toBe(271);
  });
});