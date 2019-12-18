const { createStreamFromFile, createStreamFromString } = require('../lib/createStream');
const { NanoFactory } = require('./nanoFactory');
const filename = __dirname + '/input.txt';

describe('Nano Factory', () => {
  const example1 = `
    10 ORE => 10 A
    1 ORE => 1 B
    7 A, 1 B => 1 C
    7 A, 1 C => 1 D
    7 A, 1 D => 1 E
    7 A, 1 E => 1 FUEL`;
  
  // The first two reactions use only ORE as inputs; they indicate that you can produce as much 
  // of chemical A as you want (in increments of 10 units, each 10 costing 10 ORE) and as much 
  // of chemical B as you want (each costing 1 ORE). To produce 1 FUEL, a total of 31 ORE is 
  // required: 1 ORE to produce 1 B, then 30 more ORE to produce the 7 + 7 + 7 + 7 = 28 A 
  // (with 2 extra A wasted) required in the reactions to convert the B into C, C into D, 
  // D into E, and finally E into FUEL. (30 A is produced because its reaction requires that it
  // is created in increments of 10.)

  test('Example 1 requires 30 ORE to produce 1 FUEL', async () => {
    const linesAsync = createStreamFromString(example1);
    const factory = await NanoFactory.parseStream(linesAsync);

    factory.produceFuel(1);

    expect(factory.oreUsed).toBe(31);
    expect(factory.waste).toEqual([
      { units: 2, element: 'A' }
    ]);
  })

  const example2 = `
    9 ORE => 2 A
    8 ORE => 3 B
    7 ORE => 5 C
    3 A, 4 B => 1 AB
    5 B, 7 C => 1 BC
    4 C, 1 A => 1 CA
    2 AB, 3 BC, 4 CA => 1 FUEL`;

  // The above list of reactions requires 165 ORE to produce 1 FUEL:

  // Consume 45 ORE to produce 10 A.
  // Consume 64 ORE to produce 24 B.
  // Consume 56 ORE to produce 40 C.
  // Consume 6 A, 8 B to produce 2 AB.
  // Consume 15 B, 21 C to produce 3 BC.
  // Consume 16 C, 4 A to produce 4 CA.
  // Consume 2 AB, 3 BC, 4 CA to produce 1 FUEL.

  test('Example 2 requires 165 ORE to produce 1 FUEL', async () => {
    const linesAsync = createStreamFromString(example2);
    const factory = await NanoFactory.parseStream(linesAsync);

    factory.produceFuel(1);

    expect(factory.oreUsed).toBe(165);
    expect(factory.waste).toEqual([
      { units: 1, element: 'B' },
      { units: 3, element: 'C' },
    ]);
  })


  test('Example 3 requires 13312 ORE to produce 1 FUEL', async () => {
    // 13312 ORE for 1 FUEL:
    
    const reactions = `
      157 ORE => 5 NZVS
      165 ORE => 6 DCFZ
      44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
      12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
      179 ORE => 7 PSHF
      177 ORE => 5 HKGWZ
      7 DCFZ, 7 PSHF => 2 XJWVT
      165 ORE => 2 GPVTF
      3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT`;

    const linesAsync = createStreamFromString(reactions);
    const factory = await NanoFactory.parseStream(linesAsync);

    factory.produceFuel(1);

    expect(factory.oreUsed).toBe(13312);
  })


  test('Example 4 requires 180697 ORE to produce 1 FUEL', async () => {
    const reactions = `
      2 VPVL, 7 FWMGM, 2 CXFTF, 11 MNCFX => 1 STKFG
      17 NVRVD, 3 JNWZP => 8 VPVL
      53 STKFG, 6 MNCFX, 46 VJHF, 81 HVMC, 68 CXFTF, 25 GNMV => 1 FUEL
      22 VJHF, 37 MNCFX => 5 FWMGM
      139 ORE => 4 NVRVD
      144 ORE => 7 JNWZP
      5 MNCFX, 7 RFSQX, 2 FWMGM, 2 VPVL, 19 CXFTF => 3 HVMC
      5 VJHF, 7 MNCFX, 9 VPVL, 37 CXFTF => 6 GNMV
      145 ORE => 6 MNCFX
      1 NVRVD => 8 CXFTF
      1 VJHF, 6 MNCFX => 4 RFSQX
      176 ORE => 6 VJHF`;
    const linesAsync = createStreamFromString(reactions);
    const factory = await NanoFactory.parseStream(linesAsync);

    factory.produceFuel(1);

    expect(factory.oreUsed).toBe(180697);
  })


  test('Example 5 requires 2210736 ORE to produce 1 FUEL', async () => {
    // 2210736 ORE for 1 FUEL:
    const reactions = `
      171 ORE => 8 CNZTR
      7 ZLQW, 3 BMBT, 9 XCVML, 26 XMNCP, 1 WPTQ, 2 MZWV, 1 RJRHP => 4 PLWSL
      114 ORE => 4 BHXH
      14 VRPVC => 6 BMBT
      6 BHXH, 18 KTJDG, 12 WPTQ, 7 PLWSL, 31 FHTLT, 37 ZDVW => 1 FUEL
      6 WPTQ, 2 BMBT, 8 ZLQW, 18 KTJDG, 1 XMNCP, 6 MZWV, 1 RJRHP => 6 FHTLT
      15 XDBXC, 2 LTCX, 1 VRPVC => 6 ZLQW
      13 WPTQ, 10 LTCX, 3 RJRHP, 14 XMNCP, 2 MZWV, 1 ZLQW => 1 ZDVW
      5 BMBT => 4 WPTQ
      189 ORE => 9 KTJDG
      1 MZWV, 17 XDBXC, 3 XCVML => 2 XMNCP
      12 VRPVC, 27 CNZTR => 2 XDBXC
      15 KTJDG, 12 BHXH => 5 XCVML
      3 BHXH, 2 VRPVC => 7 MZWV
      121 ORE => 7 VRPVC
      7 XCVML => 6 RJRHP
      5 BHXH, 4 VRPVC => 5 LTCX`;
    const linesAsync = createStreamFromString(reactions);
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

})
