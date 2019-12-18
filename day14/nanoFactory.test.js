const { createStreamFromFile, createStreamFromString } = require('../lib/createStream');
const { examples } = require('./examples');
const { NanoFactory } = require('./nanoFactory');
const filename = __dirname + '/input.txt';

describe('Nano Factory', () => {
  
  describe('Example 1', () => {
    // The first two reactions use only ORE as inputs; they indicate that you can produce as much 
    // of chemical A as you want (in increments of 10 units, each 10 costing 10 ORE) and as much 
    // of chemical B as you want (each costing 1 ORE). To produce 1 FUEL, a total of 31 ORE is 
    // required: 1 ORE to produce 1 B, then 30 more ORE to produce the 7 + 7 + 7 + 7 = 28 A 
    // (with 2 extra A wasted) required in the reactions to convert the B into C, C into D, 
    // D into E, and finally E into FUEL. (30 A is produced because its reaction requires that it
    // is created in increments of 10.)

    test('requires 31 ORE to produce 1 FUEL', async () => {
      const linesAsync = createStreamFromString(examples.example1);
      const factory = await NanoFactory.parseStream(linesAsync);

      factory.produceFuel(1);

      expect(factory.fuelProduced).toBe(1);
      expect(factory.oreUsed).toBe(31);
      expect(factory.waste).toEqual([
        { element: 'A', units: 2 }
      ]);
    })

    test('cannot produce any FUEL from 10 ORE', async () => {
      const linesAsync = createStreamFromString(examples.example1);
      const factory = await NanoFactory.parseStream(linesAsync, 10);

      factory.produceFuel(1);

      expect(factory.fuelProduced).toBe(0);
      expect(factory.oreUsed).toBe(10);
      expect(factory.waste).toEqual([
        { element: 'A', units: 10 },
      ]);
    })

    test('can produce 5 FUEL from 145 ORE', async () => {
      const linesAsync = createStreamFromString(examples.example1);
      const factory = await NanoFactory.parseStream(linesAsync, 145);

      factory.produceFuel(5);

      expect(factory.fuelProduced).toBe(5);
      expect(factory.oreUsed).toBe(145);
      expect(factory.waste).toEqual([
        /* no waste */
      ]);
    })

    test('can only produce 5 FUEL from 145 ORE', async () => {
      const linesAsync = createStreamFromString(examples.example1);
      const factory = await NanoFactory.parseStream(linesAsync, 145);

      factory.produceAllFuel();

      expect(factory.fuelProduced).toBe(5);
      expect(factory.oreUsed).toBe(145);
      expect(factory.waste).toEqual([
        /* no waste */
      ]);
    })

    test('can only produce 5 FUEL from 175 ORE', async () => {
      const linesAsync = createStreamFromString(examples.example1);
      const factory = await NanoFactory.parseStream(linesAsync, 175);

      factory.produceAllFuel();

      expect(factory.fuelProduced).toBe(5);
      expect(factory.oreUsed).toBe(175);
      expect(factory.waste).toEqual([
        { element: 'A', units: 30 },
      ]);
    })
  })

  // The above list of reactions requires 165 ORE to produce 1 FUEL:

  // Consume 45 ORE to produce 10 A.
  // Consume 64 ORE to produce 24 B.
  // Consume 56 ORE to produce 40 C.
  // Consume 6 A, 8 B to produce 2 AB.
  // Consume 15 B, 21 C to produce 3 BC.
  // Consume 16 C, 4 A to produce 4 CA.
  // Consume 2 AB, 3 BC, 4 CA to produce 1 FUEL.

  test('Example 2 requires 165 ORE to produce 1 FUEL', async () => {
    const linesAsync = createStreamFromString(examples.example2);
    const factory = await NanoFactory.parseStream(linesAsync);

    factory.produceFuel(1);

    expect(factory.oreUsed).toBe(165);
    expect(factory.waste).toEqual([
      { units: 1, element: 'B' },
      { units: 3, element: 'C' },
    ]);
  })

  test('Example 3 requires 13312 ORE to produce 1 FUEL', async () => {

    const linesAsync = createStreamFromString(examples.example3);
    const factory = await NanoFactory.parseStream(linesAsync);

    factory.produceFuel(1);

    expect(factory.oreUsed).toBe(13312);
  })

  test('Example 4 requires 180697 ORE to produce 1 FUEL', async () => {
    const linesAsync = createStreamFromString(examples.example4);
    const factory = await NanoFactory.parseStream(linesAsync);

    factory.produceFuel(1);

    expect(factory.oreUsed).toBe(180697);
  })

  test('Example 5 requires 2210736 ORE to produce 1 FUEL', async () => {
    const linesAsync = createStreamFromString(examples.example5);
    const factory = await NanoFactory.parseStream(linesAsync);

    factory.produceFuel(1);

    expect(factory.oreUsed).toBe(2210736);
  })


  test('Puzzle Input requires 1582325 ORE to produce 1 FUEL', async () => {
    const linesAsync = createStreamFromFile(filename);
    const factory = await NanoFactory.parseStream(linesAsync);

    factory.produceFuel(1);

    expect(factory.oreUsed).toBe(1582325);
  })


  
  test.skip('Example 3 The 13312 ORE-per-FUEL example could produce 82892753 FUEL.', async () => {
    // The 13312 ORE-per-FUEL example could produce 82892753 FUEL.

    const linesAsync = createStreamFromString(examples.example3);
    const factory = await NanoFactory.parseStream(linesAsync);

    factory.produceAllFuel();

    expect(factory.fuelProduced).toBe(82892753);
  })

  // The 180697 ORE-per-FUEL example could produce 5586022 FUEL.
  // The 2210736 ORE-per-FUEL example could produce 460664 FUEL.
})
