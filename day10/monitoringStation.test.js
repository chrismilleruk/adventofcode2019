const { createStreamFromString, createStreamFromFile } = require('../lib/createStream');
const { getCoords, detectAsteroids, findBestLocation, fireRotatingLaser } = require('./monitoringStation');

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

  describe('Math.atan2 test', () => {
    test('0,0 = top left, start pointing up, clockwise direction', () => {
      const coords = [
        [0, -1],
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, 1],
      ];
      let angles = coords.map(coord => { return Math.atan2(coord[0], coord[1]) * (180 / Math.PI) });
      expect(angles).toEqual([180, 135, 90, 45, 0, -45, -90, -45]);
    });
  });

  describe('rotating laser', () => {
    const example1 = `
    .#....#####...#..
    ##...##.#####..##
    ##...#...#.#####.
    ..#.....X...###..
    ..#.#.....#....##
    `;

    test('check best location = [8, 3]', async () => {
      const coords = await detectAsteroids(createStreamFromString(example1));
      const best = await findBestLocation(coords);

      expect(best.coord).toEqual([8, 3]);
      expect(best.detected).toEqual(30);
    });

    test('check rotation and order of shots', async () => {
      const asteroids = await detectAsteroids(createStreamFromString(example1));
      const station = await findBestLocation(asteroids);

      const shots = [];
      for (let shot of fireRotatingLaser(asteroids, station)) {
        shots.push(shot);
      }
      let count = shots.length;

      expect(count).toBe(asteroids.size - 1);

      // The first nine asteroids to get vaporized, in order, would be:
      // .#....###24...#..
      // ##...##.13#67..9#
      // ##...#...5.8####.
      // ..#.....X...###..
      // ..#.#.....#....##
      expect(shots[0].coord).toEqual([8, 1]);

      // The laser continues rotating; the next nine to be vaporized are:
      // .#....###.....#..
      // ##...##...#.....#
      // ##...#......1234.
      // ..#.....X...5##..
      // ..#.9.....8....76
      expect(shots[9].coord).toEqual([12, 2]);

      // The next nine to be vaporized are then:
      // .8....###.....#..
      // 56...9#...#.....#
      // 34...7...........
      // ..2.....X....##..
      // ..1..............
      expect(shots[18].coord).toEqual([2, 4]);

      // Finally, the laser completes its first full rotation (1 through 3), 
      // a second rotation (4 through 8), and vaporizes the last asteroid (9) 
      // partway through its third rotation:
      // ......234.....6..
      // ......1...5.....7
      // .................
      // ........X....89..
      // .................
      expect(shots[27].coord).toEqual([6, 1]);
      expect(shots[count - 1].coord).toEqual([14, 3]);
    });

    test('large example', async () => {
      // In the large example above (the one with the best monitoring station location at 11,13):
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
      const asteroids = await detectAsteroids(createStreamFromString(map));
      const station = await findBestLocation(asteroids);

      const shots = [];
      for (let shot of fireRotatingLaser(asteroids, station)) {
        shots.push(shot);
      }
      let count = shots.length;


      // The 1st asteroid to be vaporized is at 11,12.
      expect(shots[1 - 1].coord).toEqual([11, 12]);
      // The 2nd asteroid to be vaporized is at 12,1.
      expect(shots[2 - 1].coord).toEqual([12, 1]);
      // The 3rd asteroid to be vaporized is at 12,2.
      expect(shots[3 - 1].coord).toEqual([12, 2]);
      // The 10th asteroid to be vaporized is at 12,8.
      expect(shots[10 - 1].coord).toEqual([12, 8]);
      // The 20th asteroid to be vaporized is at 16,0.
      expect(shots[20 - 1].coord).toEqual([16, 0]);
      // The 50th asteroid to be vaporized is at 16,9.
      expect(shots[50 - 1].coord).toEqual([16, 9]);
      // The 100th asteroid to be vaporized is at 10,16.
      expect(shots[100 - 1].coord).toEqual([10, 16]);
      // The 199th asteroid to be vaporized is at 9,6.
      expect(shots[199 - 1].coord).toEqual([9, 6]);
      // The 200th asteroid to be vaporized is at 8,2.
      expect(shots[200 - 1].coord).toEqual([8, 2]);
      // The 201st asteroid to be vaporized is at 10,9.
      expect(shots[201 - 1].coord).toEqual([10, 9]);
      // The 299th and final asteroid to be vaporized is at 11,1.
      expect(shots[299 - 1].coord).toEqual([11, 1]);
      expect(count).toBe(299);
    });
  });
});
