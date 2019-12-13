const {
  createStreamFromString,
  createStreamFromFile
} = require('../lib/createStream');
const {
  getOrbitChecksum,
  buildOrbitMap,
  shortestDistanceBetweenPlanets
} = require('./orbitComputer')

describe('Day 6: Universal Orbit Map', () => {
  describe('example map', () => {
    const mapData = `
COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L`;
    test('load example', async () => {
      let inputStream = createStreamFromString(mapData);
      let orbitMap = await buildOrbitMap(inputStream);

      expect([...orbitMap.keys()]).toMatchObject(['B', 'COM', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']);
      expect(orbitMap.size).toBe(12);
    });
    test('verify checksum', async () => {
      let inputStream = createStreamFromString(mapData);
      let orbitMap = await buildOrbitMap(inputStream);
      let checksum = getOrbitChecksum(orbitMap);

      expect(checksum).toBe(42);
    });
    test('shortest distance between two planets', async () => {
      let inputStream = createStreamFromString(mapData);
      let orbitMap = await buildOrbitMap(inputStream);
      let start = orbitMap.get('H');
      let destination = orbitMap.get('I');
      let distance = shortestDistanceBetweenPlanets(start, destination);
      expect(distance).toBe(3);
    });
  })

})
