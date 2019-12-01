const fs = require('fs');
const readline = require('readline');

const filename = __dirname+'/day1input.txt';

if (require.main === module) {
  processInputFile(filename).then(fuel => console.log(fuel));
}

function calculateFuel(mass) {
  /* Fuel required to launch a given module is based on its mass. Specifically,
  to find the fuel required for a module, take its mass, divide by three,
  round down, and subtract 2.  */
  return Math.floor(mass / 3) - 2;
}

async function processInputFile(filename) {
  // This line opens the file as a readable stream
  var readStream = fs.createReadStream(filename);
  var totalFuel = 0;

  const readInterface = readline.createInterface({
      input: readStream,
      // output: process.stdout,
      console: false
  });

  for await (const line of readInterface) {
    let mass = parseInt(line, 10);
    let fuel = calculateFuel(mass);
    // console.log('fuel', fuel);
    totalFuel += fuel;
  }

  return totalFuel;
}

module.exports = { calculateFuel, processInputFile };
