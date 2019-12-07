const {
  getOrbitChecksum,
  loadInputFile
} = require('./orbitComputer');


const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    const orbitMapData = await loadInputFile(filename);

    try {
      let checksum = getOrbitChecksum(orbitMapData);
      console.log('Map data Orbit Checksum: ', checksum);
    } catch (ex) {
      console.error(ex);
    }

  })();
}