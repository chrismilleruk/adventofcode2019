const { runAmplifySequence, findMaxAmplifySequence } = require('./amplifier');

describe('Amplifier Controller Software', () => {
  describe('some example programs', () => {
    describe('Max thruster signal 43210 (from phase setting sequence 4,3,2,1,0)', () => {
      const buffer = [3, 15, 3, 16, 1002, 16, 10, 16, 1, 16, 15, 15, 4, 15, 99, 0, 0];
      const phaseSettingSequence = [4, 3, 2, 1, 0];
      const maxThrusterSignal = 43210;

      test('Test optimal settings', () => {
        const result = runAmplifySequence(buffer.slice(), phaseSettingSequence);
        expect(result).toBe(maxThrusterSignal);
      });
      
      test('Find best settings', () => {
        const result = findMaxAmplifySequence(buffer);
        expect(result.sequence).toStrictEqual(phaseSettingSequence);
        expect(result.max).toBe(maxThrusterSignal);
      })
    });

    describe('Max thruster signal 54321 (from phase setting sequence 0,1,2,3,4)', () => {
      const buffer = [3, 23, 3, 24, 1002, 24, 10, 24, 1002, 23, -1, 23,
        101, 5, 23, 23, 1, 24, 23, 23, 4, 23, 99, 0, 0];
      const phaseSettingSequence = [0, 1, 2, 3, 4];
      const maxThrusterSignal = 54321;

      test('Test optimal settings', () => {
        const result = runAmplifySequence(buffer.slice(), phaseSettingSequence);
        expect(result).toBe(maxThrusterSignal);
      });
      
      test('Find best settings', () => {
        const result = findMaxAmplifySequence(buffer);
        expect(result.sequence).toStrictEqual(phaseSettingSequence);
        expect(result.max).toBe(maxThrusterSignal);
      })
    });

    describe('Max thruster signal 65210 (from phase setting sequence 1,0,4,3,2)', () => {
      const buffer = [3, 31, 3, 32, 1002, 32, 10, 32, 1001, 31, -2, 31, 1007, 31, 0, 33,
        1002, 33, 7, 33, 1, 33, 31, 31, 1, 32, 31, 31, 4, 31, 99, 0, 0, 0];
      const phaseSettingSequence = [1, 0, 4, 3, 2];
      const maxThrusterSignal = 65210;

      test('Test optimal settings', () => {
        const result = runAmplifySequence(buffer.slice(), phaseSettingSequence);
        expect(result).toBe(maxThrusterSignal);
      });
      
      test('Find best settings', () => {
        const result = findMaxAmplifySequence(buffer);
        expect(result.sequence).toStrictEqual(phaseSettingSequence);
        expect(result.max).toBe(maxThrusterSignal);
      })
    });
  });
});