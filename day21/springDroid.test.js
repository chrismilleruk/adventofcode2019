const { SpringDroid, SpringScriptTester } = require('./springDroid');
const filename = __dirname + '/input.txt';

describe('Spring Droid', () => {
  // ???.
  describe('walk', () => {
    describe('programs 1-5', () => {
      const program1 = `
        NOT D J
        `;
      
      test('program 1 jumps into a hole `#.#`.', async () => {
        const springDroid = new SpringDroid(filename);
        await springDroid.loadSpringScript(program1);
        await springDroid.walk();

        expect(springDroid.result).toBe(10);
        expect(springDroid.lastMoments).toBe(`
Walking...


Didn't make it across:

.................
.................
@................
#####.###########

.................
.................
.@...............
#####.###########

.................
..@..............
.................
#####.###########

...@.............
.................
.................
#####.###########

.................
....@............
.................
#####.###########

.................
.................
.....@...........
#####.###########

.................
.................
.................
#####@###########

`);
      });

      test.each([
        ['####', true],
        ['###.', false],
        ['##.#', false],
        ['#.##', false],
        ['.###', false]
      ])('program 1 - test case %# - %s = %d', (ground, result) => {
        const script = new SpringScriptTester(program1);
        expect(script.walk('####' + ground + '#')).toBe(result);
      });

      // ???#
      const program2 = `
        AND D J
        `;
      
      test('program 2 walks into a hole `#.#`.', async () => {
        const springDroid = new SpringDroid(filename);
        await springDroid.loadSpringScript(program2);
        await springDroid.walk();

        expect(springDroid.result).toBe(10);
        expect(springDroid.lastMoments).toBe(`
Walking...


Didn't make it across:

.................
.................
@................
#####.###########

.................
.................
.@...............
#####.###########

.................
.................
..@..............
#####.###########

.................
.................
...@.............
#####.###########

.................
.................
....@............
#####.###########

.................
.................
.................
#####@###########

`);
      })

      // .??#
      const program3 = `
        NOT A J
        `;

      test('program 3 jumps hole `#.#`, but falls into a `#..#.#`', async () => {
        const springDroid = new SpringDroid(filename);
        await springDroid.loadSpringScript(program3);
        await springDroid.walk();

        expect(springDroid.result).toBe(10);
        expect(springDroid.lastMoments).toBe(`
Walking...


Didn't make it across:

.................
.................
@................
#####..#.########

.................
.................
.@...............
#####..#.########

.................
.................
..@..............
#####..#.########

.................
.................
...@.............
#####..#.########

.................
.................
....@............
#####..#.########

.................
.....@...........
.................
#####..#.########

......@..........
.................
.................
#####..#.########

.................
.......@.........
.................
#####..#.########

.................
.................
........@........
#####..#.########

.................
.................
.................
#####..#@########

`);
      });

      test.each([
        ['####', true],
        ['###.', true],
        ['##.#', true],
        ['#.##', true],
        ['.###', true],
        ['#..#', true],
        ['#...#', true],
        ['#.#.#', true],
        ['#..#.#', false],
      ])('program 3 - test case %# - %s = %d', (ground, result) => {
        const script = new SpringScriptTester(program3);
        expect(script.walk('####' + ground + '####')).toBe(result);
      });

      // ?.?#
      const program4 = `
        AND D J
        NOT B J
        `;

      test('program 4 jumps `#.#` && `#..#.#`, but falls into a `##...#`', async () => {
        const springDroid = new SpringDroid(filename);
        await springDroid.loadSpringScript(program4);
        await springDroid.walk();

        expect(springDroid.result).toBe(10);
        expect(springDroid.lastMoments).toBe(`
Walking...


Didn't make it across:

.................
.................
@................
#####...#########

.................
.................
.@...............
#####...#########

.................
.................
..@..............
#####...#########

.................
.................
...@.............
#####...#########

.................
....@............
.................
#####...#########

.....@...........
.................
.................
#####...#########

.................
......@..........
.................
#####...#########

.................
.................
.......@.........
#####...#########

.................
.................
.................
#####..@#########

`);
      });

      // ??.#
      const program5 = `
        NOT C T
        OR T J
        AND D J
        `;
      
      test('program 5 jumps `###.#`, `##..#`, `#...#`, but falls into a `#.###` (e.g. `##..#.#`)', async () => {
        const springDroid = new SpringDroid(filename);
        await springDroid.loadSpringScript(program5);
        await springDroid.walk();

        expect(springDroid.result).toBe(10);
        expect(springDroid.lastMoments).toBe(`
Walking...


Didn't make it across:

.................
.................
@................
#####..#.########

.................
.................
.@...............
#####..#.########

.................
.................
..@..............
#####..#.########

.................
.................
...@.............
#####..#.########

.................
....@............
.................
#####..#.########

.....@...........
.................
.................
#####..#.########

.................
......@..........
.................
#####..#.########

.................
.................
.......@.........
#####..#.########

.................
.................
.................
#####..#@########

`);
      });

      test.each([
        ['#.#', true],
        ['#..#', true],
        ['#...#', true],
        // ['#.#.#', true],
        ['#..#.#', false],
      ])('program 5 - test case %# - %s = %d', (ground, result) => {
        const script = new SpringScriptTester(program5);
        expect(script.walk('####' + ground + '####')).toBe(result);
      })
    })

    describe('program 6', () => {
      // ??.#
      // .??#
      const program6 = `
        NOT C T
        OR T J
        NOT A T
        OR T J
        AND D J
        `;
      
      test('program 6 completes.', async () => {
        const springDroid = new SpringDroid(filename);
        await springDroid.loadSpringScript(program6);
        await springDroid.walk();

        expect(springDroid.result).toBe(19360288);
      });

      test.each([
        ['#.#', true],
        ['#..#', true],
        ['#...#', true],
        ['#.#.#', true],
        ['#.#..#', true],
        ['#.#...#', true],
        ['#..#.#', true],
        ['#..#..#', true],
        ['#..#...#', true],
        ['#...#.#', true],
        ['#...#..#', true],
        ['#...#...#', true],
      ])('program 6 - test case %# - %s = %d', (ground, result) => {
        const script = new SpringScriptTester(program6);
        expect(script.walk('####' + ground + '####')).toBe(result);
      });
    });

    describe('example 1 jumps if a three-tile-wide hole (with ground on the other side of the hole) is detected.', () => {
      const example1 = `
        NOT A J
        NOT B T
        AND T J
        NOT C T
        AND T J
        AND D J
        `;
      
      test.each([
        ['#.#', false],
        ['#..#', false],
        ['#...#', true],
        ['#.#.#', false],
        ['#.#..#', false],
        ['#.#...#', false],
        ['#..#.#', false],
        ['#..#..#', false],
        ['#..#...#', false],
        ['#...#.#', false],
        ['#...#..#', false],
        ['#...#...#', true],
      ])('example 1 - test case %# - %s = %d', (ground, result) => {
        const script = new SpringScriptTester(example1);
        expect(script.walk('####' + ground + '####')).toBe(result);
      });
    });
  });

  describe('run', () => {

    describe('program 6', () => {
      // ??.#
      // .??#
      const program6 = `
        NOT C T
        OR T J
        NOT A T
        OR T J
        AND D J
        `;
      
      test('program 6 fails.', async () => {
        const springDroid = new SpringDroid(filename);
        await springDroid.loadSpringScript(program6);
        await springDroid.run();

        expect(springDroid.result).toBe(10);
        expect(springDroid.lastMoments).toBe(`
Running...


Didn't make it across:

.................
.................
@................
#####.#.##...####

.................
.................
.@...............
#####.#.##...####

.................
.................
..@..............
#####.#.##...####

.................
...@.............
.................
#####.#.##...####

....@............
.................
.................
#####.#.##...####

.................
.....@...........
.................
#####.#.##...####

.................
.................
......@..........
#####.#.##...####

.................
.................
.................
#####.#@##...####

`);
      });

      test.each([
        ['#.#', true],
        ['#..#', true],
        ['#...#', true],
        ['#.#.#', true],
        ['#.#..#', true],
        ['#.#...#', true],
        ['#..#.#', true],
        ['#..#..#', true],
        ['#..#...#', true],
        ['#...#.#', true],
        ['#...#..#', true],
        ['#...#...#', true],

        ['#.##.#', true],
        ['#.##..#', true],
        ['#.##...#', true],
        ['#.##.#.#', true],
        ['#.###.#..#', true],
        ['#.###.#...#', true],
        ['#.##..#.#', true],
        ['#.##..#..#', true],
        ['#.##..#...#', true],
        ['#.##...#.#', true],
        ['#.##...#..#', true],
        ['#.##...#...#', true],

      ])('program 6 - test case %# - %s = %d', (ground, result) => {
        const script = new SpringScriptTester(program6);
        expect(script.walk('####' + ground + '####')).toBe(result);
      });
    });

    describe('program 7', () => {
      // ABCDEFGHI
      // .  #         Latest possible jump
      //  . #         Could jump here too.
      //   .#         Earliest possible jump.
      //    ##        After jump, can step OR
      //    #   #     After jump, can jump again.

      //.##.##.#.#
      const program7 = `
        NOT C T
        OR T J
        NOT B T
        OR T J
        NOT A T
        OR T J
        
        AND D J

        NOT D T
        OR E T
        OR H T
        AND T J
        `;
      test('program 7 works.', async () => {
        const springDroid = new SpringDroid(filename);
        await springDroid.loadSpringScript(program7);
        await springDroid.run();

        springDroid.lastMoments;
        expect(springDroid.result).toBeGreaterThan(10);
      })
      test.each([
        ['#.###', true],
        ['#..##', true],
        ['#...#', true],
        ['#.#.#', true],

        ['#.#..##', true],
        ['#.#...#', true],
        ['#.#.#.#', true],

        ['#..#.###', true],
        ['#..#..##', true],
        ['#..#...#', true],
        ['#..#.#.#', true],

        ['#...#.###', true],
        ['#...#..##', true],
        ['#...#...#', true],
        ['#...#.#.#', true],

        ['#.#.#.###', true],
        ['#.#.#..##', true],
        ['#.#.#...#', true],
        ['#.#.#.#.#', true],

        ['#.##.###', true],
        ['#.##..##', true],
        ['#.##...#', true],
        ['#.##.#.#', true],

        ['#.#.##...#', true],
        ['#.##...#.#', true],
        ['#.##.##.#.#', true],
        
      ])('program 7 - test case %# - %s = %d', (ground, result) => {
        const script = new SpringScriptTester(program7);
        expect(script.walk('####' + ground + '####')).toBe(result);
      });
    });
  });
});
