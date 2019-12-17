const { createStreamFromFile } = require('../lib/createStream');
const { Moon, MoonSystem } = require('./moonCalculator');

const filename = __dirname + '/input.txt';

describe('Moon Calculator', () => {
  describe('Moon', () => {

    test.each`
      str                         | x       | y       | z 
      ${'<x=7, y=10, z=17>'}      | ${7}    | ${10}   | ${17}
      ${'<x=-7, y=10, z=17>'}     | ${-7}   | ${10}   | ${17}
      ${'<x=-70, y=-10, z=-17>'}  | ${-70}  | ${-10}  | ${-17}
      ${'<x=-1, y=0, z=2>'}       | ${-1}   | ${0}    | ${2}
      ${'<x=2, y=-10, z=-7>'}     | ${2}    | ${-10}  | ${-7}
      ${'   <x=4, y=-8, z=8>'}    | ${4}    | ${-8}   | ${8}
      ${'  <x=3, y=5, z=-1>   '}  | ${3}    | ${5}    | ${-1}
    `('Moon.parse($str) = {x: $x, y: $y, z: $z}', ({ str, x, y, z }) => {
      const moon = Moon.parse(str);
      expect(moon.pos.x).toBe(x);
      expect(moon.pos.y).toBe(y);
      expect(moon.pos.z).toBe(z);
    });

    test('Moon.parse("") returns false', () => {
      const moon = Moon.parse('');
      expect(moon).toBe(false);
    });
  });

  describe('Moon System', () => {
    // For example, suppose your scan reveals the following positions:
    const example1 = `
    <x=-1, y=0, z=2>
    <x=2, y=-10, z=-7>
    <x=4, y=-8, z=8>
    <x=3, y=5, z=-1>`;

    test('Example 1: After 1 step', async () => {
      const moonSystem = MoonSystem.parse(example1)
      const moons = moonSystem.moons;

      // Simulating the motion of these moons would produce the following:
      // After 0 steps:
      // pos=<x=-1, y=  0, z= 2>, vel=<x= 0, y= 0, z= 0>
      // pos=<x= 2, y=-10, z=-7>, vel=<x= 0, y= 0, z= 0>
      // pos=<x= 4, y= -8, z= 8>, vel=<x= 0, y= 0, z= 0>
      // pos=<x= 3, y=  5, z=-1>, vel=<x= 0, y= 0, z= 0>
      expect(moons[0].pos).toEqual({ x: -1, y: 0, z: 2 });
      expect(moons[1].pos).toEqual({ x: 2, y: -10, z: -7 });
      expect(moons[2].pos).toEqual({ x: 4, y: -8, z: 8 });
      expect(moons[3].pos).toEqual({ x: 3, y: 5, z: -1 });

      // After 1 step:
      // pos=<x= 2, y=-1, z= 1>, vel=<x= 3, y=-1, z=-1>
      // pos=<x= 3, y=-7, z=-4>, vel=<x= 1, y= 3, z= 3>
      // pos=<x= 1, y=-7, z= 5>, vel=<x=-3, y= 1, z=-3>
      // pos=<x= 2, y= 2, z= 0>, vel=<x=-1, y=-3, z= 1>
      let velocities = moons.map((moon) => moon.calculateVelocity(moons));
      expect(velocities[0]).toEqual({ x: 3, y: -1, z: -1 });
      expect(velocities[1]).toEqual({ x: 1, y: 3, z: 3 });
      expect(velocities[2]).toEqual({ x: -3, y: 1, z: -3 });
      expect(velocities[3]).toEqual({ x: -1, y: -3, z: 1 });

      moons.forEach((moon, index) => moon.applyVelocity(velocities[index]));
      expect(moons[0].pos).toEqual({ x: 2, y: -1, z: 1 });
      expect(moons[1].pos).toEqual({ x: 3, y: -7, z: -4 });
      expect(moons[2].pos).toEqual({ x: 1, y: -7, z: 5 });
      expect(moons[3].pos).toEqual({ x: 2, y: 2, z: 0 });

      velocities = moons.map((moon) => moon.calculateVelocity(moons));
      moons.forEach((moon, index) => moon.applyVelocity(velocities[index]));

    });

    test('Example 1: After 2 steps', async () => {
      const moonSystem = MoonSystem.parse(example1)
      const moons = moonSystem.moons;

      // Step 1
      velocities = moons.map((moon) => moon.calculateVelocity(moons));
      moons.forEach((moon, index) => moon.applyVelocity(velocities[index]));
      expect(moons[0]).toEqual(
        // pos= <x= 2, y= -1, z= 1>,    vel=<x= 3, y= -1, z= -1>
        { pos: { x: 2, y: -1, z: 1 }, vel: { x: 3, y: -1, z: -1 } }
      );

      // After 1 step:
      // pos=<x= 2, y=-1, z= 1>, vel=<x= 3, y=-1, z=-1>
      // pos=<x= 3, y=-7, z=-4>, vel=<x= 1, y= 3, z= 3>
      // pos=<x= 1, y=-7, z= 5>, vel=<x=-3, y= 1, z=-3>
      // pos=<x= 2, y= 2, z= 0>, vel=<x=-1, y=-3, z= 1>

      // Step 2
      velocities = moons.map((moon) => moon.calculateVelocity(moons));
      moons.forEach((moon, index) => moon.applyVelocity(velocities[index]));
      expect(velocities[0]).toEqual({ x: 3, y: -2, z: -2 });
      expect(moons[0]).toEqual(
        // pos= <x= 5, y= -3, z= -1>,    vel=<x= 3, y= -2, z= -2>
        { pos: { x: 5, y: -3, z: -1 }, vel: { x: 3, y: -2, z: -2 } }
      );

      // After 2 steps:
      // pos=<x= 5, y=-3, z=-1>, vel=<x= 3, y=-2, z=-2>
      // pos=<x= 1, y=-2, z= 2>, vel=<x=-2, y= 5, z= 6>
      // pos=<x= 1, y=-4, z=-1>, vel=<x= 0, y= 3, z=-6>
      // pos=<x= 1, y=-4, z= 2>, vel=<x=-1, y=-6, z= 2>
    });

    test('Example 1: After 10 steps', async () => {
      const moonSystem = MoonSystem.parse(example1)
      moonSystem.step(10);
      const moons = moonSystem.moons;

      // After 10 steps:
      // pos=<x= 2, y= 1, z=-3>, vel=<x=-3, y=-2, z= 1>
      expect(moons[0]).toEqual({ pos: { x: 2, y: 1, z: -3 }, vel: { x: -3, y: -2, z: 1 } });

      // pos=<x= 1, y=-8, z= 0>, vel=<x=-1, y= 1, z= 3>
      expect(moons[1]).toEqual({ pos: { x: 1, y: -8, z: 0 }, vel: { x: -1, y: 1, z: 3 } });

      // pos=<x= 3, y=-6, z= 1>, vel=<x= 3, y= 2, z=-3>
      expect(moons[2]).toEqual({ pos: { x: 3, y: -6, z: 1 }, vel: { x: 3, y: 2, z: -3 } });

      // pos=<x= 2, y= 0, z= 4>, vel=<x= 1, y=-1, z=-1>
      expect(moons[3]).toEqual({ pos: { x: 2, y: 0, z: 4 }, vel: { x: 1, y: -1, z: -1 } });

    });

    test('Example 1: Energy after 10 steps', async () => {
      const moonSystem = MoonSystem.parse(example1)
      moonSystem.step(10);

      // Energy after 10 steps:
      // pot: 2 + 1 + 3 =  6;   kin: 3 + 2 + 1 = 6;   total:  6 * 6 = 36
      // pot: 1 + 8 + 0 =  9;   kin: 1 + 1 + 3 = 5;   total:  9 * 5 = 45
      // pot: 3 + 6 + 1 = 10;   kin: 3 + 2 + 3 = 8;   total: 10 * 8 = 80
      // pot: 2 + 0 + 4 =  6;   kin: 1 + 1 + 1 = 3;   total:  6 * 3 = 18
      // Sum of total energy: 36 + 45 + 80 + 18 = 179
      expect(moonSystem.moons[0].potentialEnergy).toBe(6)
      expect(moonSystem.moons[0].kineticEnergy).toBe(6)
      expect(moonSystem.moons[0].totalEnergy).toBe(36)
      expect(moonSystem.moons[1].totalEnergy).toBe(45)
      expect(moonSystem.moons[2].totalEnergy).toBe(80)
      expect(moonSystem.moons[3].totalEnergy).toBe(18)
      expect(moonSystem.totalEnergy).toBe(179)
    });

    const example2 = `
    <x=-8, y=-10, z=0>
    <x=5, y=5, z=10>
    <x=2, y=-7, z=3>
    <x=9, y=-8, z=-3>
    `;

    test('Example 2: Energy after 100 steps', () => {
      const moonSystem = MoonSystem.parse(example2)
      moonSystem.step(100);

      // After 100 steps:
      // pos=<x=  8, y=-12, z= -9>, vel=<x= -7, y=  3, z=  0>
      // pos=<x= 13, y= 16, z= -3>, vel=<x=  3, y=-11, z= -5>
      // pos=<x=-29, y=-11, z= -1>, vel=<x= -3, y=  7, z=  4>
      // pos=<x= 16, y=-13, z= 23>, vel=<x=  7, y=  1, z=  1>

      // Energy after 100 steps:
      // pot:  8 + 12 +  9 = 29;   kin: 7 +  3 + 0 = 10;   total: 29 * 10 = 290
      // pot: 13 + 16 +  3 = 32;   kin: 3 + 11 + 5 = 19;   total: 32 * 19 = 608
      // pot: 29 + 11 +  1 = 41;   kin: 3 +  7 + 4 = 14;   total: 41 * 14 = 574
      // pot: 16 + 13 + 23 = 52;   kin: 7 +  1 + 1 =  9;   total: 52 *  9 = 468
      // Sum of total energy: 290 + 608 + 574 + 468 = 1940
      expect(moonSystem.moons[0].potentialEnergy).toBe(29)
      expect(moonSystem.moons[0].kineticEnergy).toBe(10)
      expect(moonSystem.moons[0].totalEnergy).toBe(290)
      expect(moonSystem.moons[1].totalEnergy).toBe(608)
      expect(moonSystem.moons[2].totalEnergy).toBe(574)
      expect(moonSystem.moons[3].totalEnergy).toBe(468)
      expect(moonSystem.totalEnergy).toBe(1940)
    });

    test('Example 1: Positions same after 2772 steps', () => {
      const moonSystem = MoonSystem.parse(example1)
      const moons = moonSystem.moons;

      const moon0 = { x: -1, y: 0, z: 2 };
      const moon1 = { x: 2, y: -10, z: -7 };
      const moon2 = { x: 4, y: -8, z: 8 };
      const moon3 = { x: 3, y: 5, z: -1 };

      expect(moons[0].pos).toEqual(moon0);
      expect(moons[1].pos).toEqual(moon1);
      expect(moons[2].pos).toEqual(moon2);
      expect(moons[3].pos).toEqual(moon3);

      moonSystem.step(2772);

      expect(moons[0].pos).toEqual(moon0);
      expect(moons[1].pos).toEqual(moon1);
      expect(moons[2].pos).toEqual(moon2);
      expect(moons[3].pos).toEqual(moon3);
    });

    test('Example 1: Find axis repeat periods', () => {
      const moonSystem = MoonSystem.parse(example1)

      let periods = moonSystem.findAxisRepeatPeriods(3000);

      expect(periods).toEqual({ x: 18, y: 28, z: 44 });
    });

    test('Example 1: Find system repeat period', () => {
      const moonSystem = MoonSystem.parse(example1)

      let periods = moonSystem.findAxisRepeatPeriods(3000);
      periods = moonSystem.findSystemRepeatPeriod(periods);

      expect(periods.system).toEqual(2772);
    });


    test.skip('Example 2: Find repeat periods', () => {
      const moonSystem = MoonSystem.parse(example2)

      let periods = moonSystem.findAxisRepeatPeriods(6000);

      expect(periods).toEqual({"x": 2028, "y": 5898, "z": 4702});
    });

    test.skip('Example 2: Find system repeat period', () => {
      const moonSystem = MoonSystem.parse(example2)

      let periods = moonSystem.findAxisRepeatPeriods(6000);
      periods = moonSystem.findSystemRepeatPeriod(periods);

      expect(periods.system).toEqual(4686774924);
    }, 15000);

    test.skip('Example 2: Positions same after 4686774924 steps', () => {
      const moonSystem = MoonSystem.parse(example2)
      const moons = moonSystem.moons;

      const moon0 = { x: -8, y: -10, z: 0 };
      const moon1 = { x: 5, y: 5, z: 10 };
      const moon2 = { x: 2, y: -7, z: 3 };
      const moon3 = { x: 9, y: -8, z: -3 };

      expect(moons[0].pos).toEqual(moon0);
      expect(moons[1].pos).toEqual(moon1);
      expect(moons[2].pos).toEqual(moon2);
      expect(moons[3].pos).toEqual(moon3);

      moonSystem.step(4686774924);

      expect(moons[0].pos).toEqual(moon0);
      expect(moons[1].pos).toEqual(moon1);
      expect(moons[2].pos).toEqual(moon2);
      expect(moons[3].pos).toEqual(moon3);
    });
  });

  describe('Puzzle Input', () => {
    test('What is the total energy in the system after simulating the moons given in your scan for 1000 steps?', async () => {

      const moonSystem = await MoonSystem.parseStream(createStreamFromFile(filename));
      expect(moonSystem.moons.length).toEqual(4)
      moonSystem.step(1000);

      expect(moonSystem.totalEnergy).toBe(9958)
    })
  })
});
