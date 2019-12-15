
class MoonSystem {
  constructor(moons) {
    this.moons = moons;
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
    }
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
}

class Moon {
  constructor(x, y, z) {
    this.pos = { x, y, z };
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
}

module.exports = { Moon, MoonSystem };
