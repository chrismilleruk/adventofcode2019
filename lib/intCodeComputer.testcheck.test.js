const { executeCommand, executeProgram, executeProgramAsGenerator } = require('./intCodeComputer');
const fc = require('fast-check');

describe('fc: intCodeComputer', () => {
  describe.only('add', () => {
    it('1: should add two numbers (ref, ref)', () => {
      return fc.assert(
        fc.asyncProperty(
          fc.integer(),
          fc.integer(),
          async (int1, int2) => {
            let result = int1 + int2;

            let buffer = [1, 4, 5, 6, int1, int2, 0];
            let size = await executeCommand(buffer, 0);

            expect(size).toBe(4);
            expect(buffer).toEqual([1, 4, 5, 6, int1, int2, result]);
          }
        ),
        {
          numRuns: 10000,
          timeout: 100,
          verbose: true
        }
      );
    })

    it('101: should add two numbers (val, ref)', async () => {
      return fc.assert(
        fc.asyncProperty(
          fc.integer(),
          fc.integer(),
          async (int1, int2) => {
            let result = int1 + int2;

            let buffer = [101, int1, 5, 6, 0, int2, 0];
            let size = await executeCommand(buffer, 0);

            expect(size).toBe(4);
            expect(buffer).toEqual([101, int1, 5, 6, 0, int2, result]);
          }
        )
      );
    })

    it('1001: should add two numbers (ref, val)', async () => {
      return fc.assert(
        fc.asyncProperty(
          fc.integer(),
          fc.integer(),
          async (int1, int2) => {
            let result = int1 + int2;

            let buffer = [1001, 4, int2, 6, int1, 0, 0];
            let size = await executeCommand(buffer, 0);

            expect(size).toBe(4);
            expect(buffer).toEqual([1001, 4, int2, 6, int1, 0, result]);
          }
        )
      );
    })

    it('1101: should add two numbers (val, val)', async () => {
      return fc.assert(
        fc.asyncProperty(
          fc.integer(),
          fc.integer(),
          async (int1, int2) => {
            let result = int1 + int2;

            let buffer = [1101, int1, int2, 6, 0, 0, 0];
            let size = await executeCommand(buffer, 0);

            expect(size).toBe(4);
            expect(buffer).toEqual([1101, int1, int2, 6, 0, 0, result]);
          }
        )
      );
    })

    it('result ref can be out of buffer bounds.', () => {
      return fc.assert(
        fc.asyncProperty(
          fc.integer(),
          fc.integer(),
          fc.maxSafeNat(),
          async (int1, int2, pos) => {
            let result = int1 + int2;

            let buffer = [1, 4, 5, pos, int1, int2];
            let expected = buffer.slice();
            expected[pos] = result;

            let size = await executeCommand(buffer, 0);

            expect(size).toBe(4);
            expect(buffer).toEqual(expected);
          }
        ),
        {
          timeout: 100,
          verbose: true
        }
      );
    })

  })

})