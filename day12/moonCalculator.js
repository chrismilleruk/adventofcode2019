
class MoonSystem {
  constructor(moons) {
    this.moons = moons;
    this.steps = 0;
  }

  static parse(str) {
    let moons = str.split('\n')
      .map((line) => Moon.parse(line))
      .filter(moon => moon);
    return new MoonSystem(moons);
  }

  static async parseStream(linesAsync) {
    const moons = [];
    for await (const line of linesAsync) {
      let moon = Moon.parse(line);
      if (moon) moons.push(moon);
    }
    return new MoonSystem(moons);
  }

  step(steps) {
    if (!steps) steps = 1;

    while (steps--) {
      const velocities = this.moons.map((moon) => moon.calculateVelocity(this.moons));
      this.moons.forEach((moon, index) => moon.applyVelocity(velocities[index]));
      this.steps += 1;
    }
  }

  *generateAxisRepeatPeriods(upperLimit) {
    const hashes = {
      x: this.hashCodeX,
      y: this.hashCodeY,
      z: this.hashCodeZ
    };
    const found = {
      x: [0], y: [0], z: [0]
    };
    while (this.steps < upperLimit) {
      this.step(1);
      if (hashes.x === this.hashCodeX) {
        found.x.unshift(this.steps);
        yield { axis: 'x', step: found.x[0], period: found.x[0] - found.x[1] };
      }
      if (hashes.y === this.hashCodeY) {
        found.y.unshift(this.steps);
        yield { axis: 'y', step: found.y[0], period: found.y[0] - found.y[1] };
      }
      if (hashes.z === this.hashCodeZ) {
        found.z.unshift(this.steps);
        yield { axis: 'z', step: found.z[0], period: found.z[0] - found.z[1] };
      }
    }
  }

  findAxisRepeatPeriods(upperLimit) {
    let steps = { x: [], y: [], z: [] };
    let periods = { x: [], y: [], z: [] };
    for (let event of this.generateAxisRepeatPeriods(upperLimit)) {
      steps[event.axis].push(event.step);

      if (periods[event.axis].indexOf(event.period) === -1) {
        periods[event.axis].push(event.period);
      }

      if (steps.x.length > 1 && steps.y.length > 1 && steps.z.length > 1) {
        break;
      }
    }
    const { x: [x], y: [y], z: [z] } = periods;

    if (!x || !y || !z) {
      throw `periods not found within ${upperLimit} steps, { x: ${x}, y: ${y}, z: ${z} }`
    }
    
    return { x, y, z };
  }

  findSystemRepeatPeriod(periods) {
    let { x, y, z } = periods;

    while (!(x === y && y === z)) {
      switch (Math.min(x, y, z)) {
        case x:
          x += periods.x;
          break;
        case y:
          y += periods.y;
          break;
        case z:
          z += periods.z;
          break;
      }
    }
    periods.system = x;
    return periods;
  }

  get totalEnergy() {
    // The total energy for a single moon is its potential energy multiplied by its kinetic energy. 
    return this.moons.reduce((totalEnergy, moon) => totalEnergy += moon.totalEnergy, 0);
  }

  get potentialEnergy() {
    // A moon's potential energy is the sum of the absolute values of its x, y, and z position coordinates. 
    return this.moons.reduce((potentialEnergy, moon) => potentialEnergy += moon.potentialEnergy, 0);
  }

  get kineticEnergy() {
    // A moon's kinetic energy is the sum of the absolute values of its velocity coordinates. 
    return this.moons.reduce((kineticEnergy, moon) => kineticEnergy += moon.kineticEnergy, 0);
  }

  get hashCode() {
    return this.moons.reduce((hashCode, moon) => hashCode * 37 + moon.hashCode, 23);
  }

  get hashCodeX() {
    return this.moons.reduce((hashCode, moon) => hashCode * 37 + moon.hashCodeX, 23);
  }

  get hashCodeY() {
    return this.moons.reduce((hashCode, moon) => hashCode * 37 + moon.hashCodeY, 23);
  }

  get hashCodeZ() {
    return this.moons.reduce((hashCode, moon) => hashCode * 37 + moon.hashCodeZ, 23);
  }
}

class Moon {
  constructor(x, y, z) {
    this.pos = { x, y, z };
    this.vel = { x: 0, y: 0, z: 0 };
  }

  static parse(string) {
    // <x=7, y=10, z=17>
    const obj = {};
    const tokens = string.trim().slice(1).split(', ');
    for (let token of tokens) {
      let equ = token.split('=');
      obj[equ[0]] = parseInt(equ[1], 10);
    }
    if (typeof obj.x === "number" && typeof obj.y === "number" && typeof obj.z === "number") {
      return new Moon(obj.x, obj.y, obj.z);
    }
    return false;
  }

  calculateVelocity(otherMoons) {
    // To apply gravity, consider every pair of moons. On each axis (x, y, and z), 
    // the velocity of each moon changes by exactly +1 or -1 to pull the moons together. 
    // For example, if Ganymede has an x position of 3, and Callisto has a x position of 5, 
    // then Ganymede's x velocity changes by +1 (because 5 > 3) and Callisto's x velocity 
    // changes by -1 (because 3 < 5). However, if the positions on a given axis are the same, 
    // the velocity on that axis does not change for that pair of moons.
    const v = this.vel ?
      { x: this.vel.x, y: this.vel.y, z: this.vel.z }
      : { x: 0, y: 0, z: 0 };

    for (const moon of otherMoons) {
      if (moon.pos.x > this.pos.x) {
        v.x += 1;
      } else if (moon.pos.x < this.pos.x) {
        v.x -= 1;
      }

      if (moon.pos.y > this.pos.y) {
        v.y += 1;
      } else if (moon.pos.y < this.pos.y) {
        v.y -= 1;
      }

      if (moon.pos.z > this.pos.z) {
        v.z += 1;
      } else if (moon.pos.z < this.pos.z) {
        v.z -= 1;
      }
    }

    return v;
  }

  applyVelocity(velocity) {
    this.vel = velocity;
    this.pos.x += velocity.x;
    this.pos.y += velocity.y;
    this.pos.z += velocity.z;
  }

  get totalEnergy() {
    // The total energy for a single moon is its potential energy multiplied by its kinetic energy. 
    return this.potentialEnergy * this.kineticEnergy;
  }

  get potentialEnergy() {
    // A moon's potential energy is the sum of the absolute values of its x, y, and z position coordinates. 
    return Math.abs(this.pos.x) + Math.abs(this.pos.y) + Math.abs(this.pos.z);
  }

  get kineticEnergy() {
    // A moon's kinetic energy is the sum of the absolute values of its velocity coordinates. 
    return Math.abs(this.vel.x) + Math.abs(this.vel.y) + Math.abs(this.vel.z);
  }

  get hashCode() {
    let hash = 23;
    hash = hash * 37 + this.pos.x;
    hash = hash * 37 + this.pos.y;
    hash = hash * 37 + this.pos.z;
    hash = hash * 37 + this.vel.x;
    hash = hash * 37 + this.vel.y;
    hash = hash * 37 + this.vel.z;
    return hash;
  }

  get hashCodeX() {
    let hash = 23;
    hash = hash * 37 + this.pos.x;
    hash = hash * 37 + this.vel.x;
    return hash;
  }

  get hashCodeY() {
    let hash = 23;
    hash = hash * 37 + this.pos.y;
    hash = hash * 37 + this.vel.y;
    return hash;
  }

  get hashCodeZ() {
    let hash = 23;
    hash = hash * 37 + this.pos.z;
    hash = hash * 37 + this.vel.z;
    return hash;
  }
}

module.exports = { Moon, MoonSystem };
