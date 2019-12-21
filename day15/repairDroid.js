const { executeProgramAsGenerator } = require('../lib/intCodeComputer')


async function* runRepairDroid(program, droid, maxMoves = -1) {
  // Accept a movement command via an input instruction.
  // Send the movement command to the repair droid.
  // Wait for the repair droid to finish the movement operation.
  // Report on the status of the repair droid via an output instruction.
  // Only four movement commands are understood: north (1), south (2), west (3), and east (4). Any other command is invalid. The movements differ in direction, but not in distance: in a long enough east-west hallway, a series of commands like 4,4,4,4,3,3,3,3 would leave the repair droid back where it started.
  
  let lastMove = 0;
  const inputFn = () => {
    lastMove = droid.next();
    if (lastMove.done) {
      return -1;
      // throw `No more inputs from droid.`
    }
    return lastMove.value;
  };
  const outputAsync = executeProgramAsGenerator(program, inputFn);
  for await (const output of outputAsync) {
    yield droid.move(lastMove.value, output);
    maxMoves -= 1;
    if (maxMoves === 0) break;
  }
}

class Location {
  constructor(x, y, content = Content.Unknown) {
    this.coord = [x, y];
    this.content = content;
    this.distance;
  }

  get key() {
    return Location.getKey(this.coord);
  }

  static getKey(coord) {
    return String(coord);
  }

  get color() {
    return this.content;
  }
}

const Direction = {
  North: 1,
  South: 2,
  West: 3,
  East: 4
}

const Content = {
  Unknown: -1,
  Wall: 0,
  Empty: 1,
  OxygenSystem: 2
}

class RepairDroid {
  // Only four movement commands are understood: north (1), south (2), west (3), and east (4). Any other command is invalid. The movements differ in direction, but not in distance: in a long enough east-west hallway, a series of commands like 4,4,4,4,3,3,3,3 would leave the repair droid back where it started.
  
  // You don't know anything about the area around the repair droid, but you can figure it out by watching the status codes.
  
  constructor() {
    this.map = new Map();
    this.directions = [Direction.North, Direction.East, Direction.South, Direction.West];
    this.location = new Location(0, 0, Content.Empty);
    this.location.distance = 0;
    this.map.set(this.location.key, this.location);
  }

  [Symbol.iterator]() { return this; }

  get pos() {
    return this.location.coord;
  }

  get direction() {
    return this.directions[0];
  }

  set direction(direction) {
    if (this.directions.indexOf(direction) === -1) {
      throw `Unknown direction ${direction}`;
    }
    while (this.direction !== direction) {
      this.rotateLeft();
    }
  }
  
  rotateRight() {
    this.directions.push(this.directions.shift());
  }

  rotateLeft() {
    this.directions.unshift(this.directions.pop());
  }

  next() {
    // if (this._oxygenSystem) {
    //   return { done: true };
    // }

    let direction = this.directions.find((dir) => this.peek(dir) === Content.Unknown);
    if (typeof direction !== 'undefined') {
      this.direction = direction;
      return { value: direction, done: false };
    }

    return { value: this.direction, done: false };

    // direction = this.directions.find((dir) => this.peek(dir) === Content.Empty);
    // if (typeof direction !== 'undefined') {
    //   this.direction = direction;
    //   return { value: direction, done: false };
    // }
  }

  get done() {
    return !!this._oxygenSystem;
  }

  get oxygenSystem() {
    return this._oxygenSystem;
  }

  move(direction, content) {
    // The repair droid can reply with any of the following status codes:
  
    // 0: The repair droid hit a wall. Its position has not changed.
    // 1: The repair droid has moved one step in the requested direction.
    // 2: The repair droid has moved one step in the requested direction; its new position is the location of the oxygen system.  
    const location = this.getLocation(direction);
    
    // If we've never been here before, set the content and shortest distance.
    if (location.content === Content.Unknown) {
      location.content = content;
      location.distance = this.location.distance + 1;
    }

    switch (location.content) {
      case Content.Wall:
        this.rotateRight();
        break;
      case Content.Empty:
        this.location = location;
        this.rotateLeft();
        break;
      case Content.OxygenSystem:
        this.location = location;
        this._oxygenSystem = location;
        break;
    }

    return { pos: this.pos, dir: this.direction, location };
  }

  peek(direction) {
    const location = this.getLocation(direction);
    return location.content;
  }

  getLocation(direction) {
    let newCoord = [...this.pos];
    switch (direction) {
      case Direction.North:
        newCoord[1] -= 1;
        break;
      case Direction.South:
        newCoord[1] += 1;
        break;
      case Direction.West:
        newCoord[0] -= 1;
        break;
      case Direction.East:
        newCoord[0] += 1;
        break;
    }
    const key = Location.getKey(newCoord);
    let location = this.map.get(key);
    if (!location) {
      location = new Location(newCoord[0], newCoord[1]);
      this.map.set(key, location);
    }
    return location;
  }
}

module.exports = { runRepairDroid, RepairDroid, Direction, Content };
