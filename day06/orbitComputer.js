const { createStreamFromString, createStreamFromFile } = require('./loadInput');


function loadInputFile(filename) {
  let inputStream = createStreamFromFile(filename);
  return buildOrbitMap(inputStream);
}

async function buildOrbitMap(inputStream) {
  const orbitMap = new Map();
  for await (const element of inputStream) {
    let [inner, outer] = element.split(')');

    let orbitOuter = getOrbitObject(outer);
    let orbitInner = getOrbitObject(inner);
    orbitInner.addPlanet(orbitOuter);
  }
  
  return orbitMap;

  function getOrbitObject(name) {
    if (orbitMap.has(name)) {
      return orbitMap.get(name);
    }
    let o = new Planet(name);
    orbitMap.set(name, o);
    return o;
  }
}

class Planet {
  constructor(name) {
    this.name = name;
    this.planets = new Set();
  }

  addPlanet(planet) {
    if (this.planets.has(planet)) {
      return;
    }

    planet.parent = this;
    this.planets.add(planet);
  }

  set parent(planet) {
    if (!!this._parent) {
      // TODO: remove current parent.
      throw 'changing parent, not implemented'
    }

    this._parent = planet;
  }

  *parents() {
    let p = this;
    while (!!p._parent) {
      p = p._parent;
      yield p;
    }
    return;
  }
}

function getOrbitChecksum(orbitMap) {
  let root = orbitMap.get('COM');

  if (!!root.parent) {
    throw `root object is not COM, parent is ${root.parent}`;
  }

  let checksum = recursePlanets(root);
  return checksum;
}

function recursePlanets(node) {
  let count = 0;

  for (let planet of node.planets) {
    // planet.name/*?*/;
    for (let ancestor of planet.parents()) {
      // ancestor.name;/*?*/
      count += 1;
    }
    count += recursePlanets(planet);
  }

  return count;
}


module.exports = {
  getOrbitChecksum,
  buildOrbitMap,
  loadInputFile,
  Planet
};