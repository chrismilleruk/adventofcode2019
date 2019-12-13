const {
  getOrbitChecksum,
  shortestDistanceBetweenPlanets,
  loadOrbitFile
} = require('./orbitComputer');


const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    const orbitMapData = await loadOrbitFile(filename);

    try {
      let checksum = getOrbitChecksum(orbitMapData);
      console.log('Map data Orbit Checksum: ', checksum);

      let start = orbitMapData.get('YOU');
      let destination = orbitMapData.get('SAN');
      let distance = shortestDistanceBetweenPlanets(start, destination);
      console.log('Distance from YOU to SAN: ', distance);

    } catch (ex) {
      console.error(ex);
    }
  })();
}
