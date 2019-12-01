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

function calculateFuelRecursive(mass) {
  /* Fuel itself requires fuel just like a module - take its mass, divide by
  three, round down, and subtract 2. However, that fuel also requires fuel, and
  that fuel requires fuel, and so on. Any mass that would require negative
  fuel should instead be treated as if it requires zero fuel; the remaining
  mass, if any, is instead handled by wishing really hard, which has no mass
  and is outside the scope of this calculation. */
  let fuelForFuelAndMass = 0;
  let fuel = calculateFuel(mass);

  // repeat the process, continuing until a fuel requirement is zero or negative
  while (fuel > 0) {
    fuelForFuelAndMass += fuel;
    fuel = calculateFuel(fuel);
  }

  return fuelForFuelAndMass;
}

async function processInputFile(filename, recursive) {
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
    let fuel = recursive ? calculateFuelRecursive(mass) : calculateFuel(mass);
    totalFuel += fuel;
  }

  return totalFuel;
}

module.exports = { calculateFuel, calculateFuelRecursive, processInputFile };
