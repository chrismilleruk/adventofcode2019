const { createStreamFromString, createStreamFromFile } = require('../lib/createStream');
const { getCoords, detectAsteroids, findBestLocation } = require('./monitoringStation');

describe('Day 10: Monitoring Station', () => {
  describe('example 1', () => {
    const example1 = `
    .#..#
    .....
    #####
    ....#
    ...## `;

    test('load lines', async () => {
      expect.assertions(5);
      const linesAsync = createStreamFromString(example1);
      for await (const line of linesAsync) {
        expect(line.length).toBe(5);
      }
    });

    test('get coordinates', async () => {
      // The best location for a new monitoring station on this map is the highlighted 
      // asteroid at 3,4 because it can detect 8 asteroids, more than any other location. 
      // (The only asteroid it cannot detect is the one at 1,0; its view of this asteroid 
      // is blocked by the asteroid at 2,2.)

      expect.assertions(5);
      const coordsAsync = getCoords(createStreamFromString(example1));

      let coords = [];
      for await (let coord of coordsAsync) {
        coords.push(coord);
      }

      expect(coords.length).toBe(10);
      expect(coords).toContainEqual([1, 0]);
      expect(coords).not.toContainEqual([0, 1]);
      expect(coords).toContainEqual([3, 4]);
      expect(coords).toContainEqual([2, 2]);
    });

    test('detect asteroids', async () => {
      // Here is the number of other asteroids a monitoring station on each asteroid could detect:
  
      // .7..7
      // .....
      // 67775
      // ....7
      // ...87
  
      expect.assertions(2);
      const coords = await detectAsteroids(createStreamFromString(example1));

      // The best location for a new monitoring station on this map is the highlighted 
      // asteroid at 3,4 because it can detect 8 asteroids
      expect(coords.get('3,4')).toMatchObject({ detected: 8 });

      const detected = [...coords].map(x => x[1].detected).sort();
      expect(detected).toEqual([5, 6, 7, 7, 7, 7, 7, 7, 7, 8]);
    });

    test('find best location', async () => {
      // The best location for a new monitoring station on this map is the highlighted 
      // asteroid at 3,4 because it can detect 8 asteroids
      
      expect.assertions(2);

      const coords = await detectAsteroids(createStreamFromString(example1));
      const best = await findBestLocation(coords);

      expect(best.coord).toEqual([3, 4]);
      expect(best.detected).toBe(8);
    });
  });

  describe('larger examples', () => {
    //     Here are some larger examples:

    test('Best is 5,8 with 33 other asteroids detected', async () => {
      expect.assertions(2);

      let map = `
      ......#.#.
      #..#.#....
      ..#######.
      .#.#.###..
      .#..#.....
      ..#....#.#
      #..#....#.
      .##.#..###
      ##...#..#.
      .#....####
      `;
      const coords = await detectAsteroids(createStreamFromString(map));
      const best = await findBestLocation(coords);

      expect(best.coord).toEqual([5, 8]);
      expect(best.detected).toBe(33);
    });

    test('Best is 1,2 with 35 other asteroids detected', async () => {
      expect.assertions(2);

      let map = `
      #.#...#.#.
      .###....#.
      .#....#...
      ##.#.#.#.#
      ....#.#.#.
      .##..###.#
      ..#...##..
      ..##....##
      ......#...
      .####.###.
      `;
      const coords = await detectAsteroids(createStreamFromString(map));
      const best = await findBestLocation(coords);

      expect(best.coord).toEqual([1, 2]);
      expect(best.detected).toBe(35);
    });

    test('Best is 6,3 with 41 other asteroids detected', async () => {
      expect.assertions(2);

      let map = `
      .#..#..###
      ####.###.#
      ....###.#.
      ..###.##.#
      ##.##.#.#.
      ....###..#
      ..#.#..#.#
      #..#.#.###
      .##...##.#
      .....#.#..
      `;
      const coords = await detectAsteroids(createStreamFromString(map));
      const best = await findBestLocation(coords);

      expect(best.coord).toEqual([6, 3]);
      expect(best.detected).toBe(41);
    });

    test('Best is 11,13 with 210 other asteroids detected', async () => {
      expect.assertions(2);

      let map = `
      .#..##.###...#######
      ##.############..##.
      .#.######.########.#
      .###.#######.####.#.
      #####.##.#.##.###.##
      ..#####..#.#########
      ####################
      #.####....###.#.#.##
      ##.#################
      #####.##.###..####..
      ..######..##.#######
      ####.##.####...##..#
      .#####..#.######.###
      ##...#.##########...
      #.##########.#######
      .####.#.###.###.#.##
      ....##.##.###..#####
      .#.#.###########.###
      #.#.#.#####.####.###
      ###.##.####.##.#..##
      `;
      const coords = await detectAsteroids(createStreamFromString(map));
      const best = await findBestLocation(coords);

      expect(best.coord).toEqual([11, 13]);
      expect(best.detected).toBe(210);
    });

  });
});
