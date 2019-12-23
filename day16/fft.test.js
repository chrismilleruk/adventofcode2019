const { FFT } = require('./fft')
const { createStreamFromFile } = require('../lib/createStream');
const filename = __dirname + '/input.txt';

describe('Flawed Frequency Transmission', () => {
  describe('Examples', () => {
    test('Input signal: 12345678', () => {
      const fft = new FFT('12345678');
      expect(fft.value).toBe('12345678');
      fft.step();
      expect(fft.value).toBe('48226158');
      fft.step();
      expect(fft.value).toBe('34040438');
      fft.step();
      expect(fft.value).toBe('03415518');
      fft.step();
      expect(fft.value).toBe('01029498');
    })

    test('Input signal: 2222222233333333 with offset 8', () => {
      const fft = new FFT('1111111111111111', 8);
      expect(fft.value).toBe('1111111111111111');
      expect(fft.offset).toBe(8);
      expect(fft.digitsAtOffset).toBe('11111111');
      fft.step();
      expect(fft.digitsAtOffset).toBe('87654321');
      expect(fft.value).toBe('0000000087654321');
      fft.step();
      expect(fft.digitsAtOffset).toBe('68150631');
      expect(fft.value).toBe('0000000068150631');
      fft.step();
      expect(fft.digitsAtOffset).toBe('04650041');
      expect(fft.value).toBe('0000000004650041');
      fft.step();
      expect(fft.digitsAtOffset).toBe('00605551');
      expect(fft.value).toBe('0000000000605551');
    })

    // Here are the first eight digits of the final output list after 100 phases for some larger inputs:

    // 80871224585914546619083218645595 becomes 24176176.
    // 19617804207202209144916044189917 becomes 73745418.
    // 69317163492948606335995924319873 becomes 52432133.
    // After 100 phases of FFT, what are the first eight digits in the final output list?
    test.each`
    input | output
    ${'80871224585914546619083218645595'} becomes | ${'24176176'}.
    ${'19617804207202209144916044189917'} becomes | ${'73745418'}.
    ${'69317163492948606335995924319873'} becomes | ${'52432133'}.
    `('After 100 phases, $input, $output', ({ input, output }) => {
      const fft = new FFT(input);
      expect(fft.value).toBe(input);

      fft.step(100);

      expect(fft.first8digits).toBe(output);
    })

    // Here is the eight-digit message in the final output list after 100 phases. 
    // The message offset given in each input has been highlighted. (Note that the 
    // inputs given below are repeated 10000 times to find the actual starting input lists.)

    // 03036732577212944063491565474664 becomes 84462026.
    // 02935109699940807407585447034323 becomes 78725270.
    // 03081770884921959731165446850517 becomes 53553731.
    test.skip.each`
    input | output
    ${'03036732577212944063491565474664'} becomes | ${'84462026'}.
    ${'02935109699940807407585447034323'} becomes | ${'78725270'}.
    ${'03081770884921959731165446850517'} becomes | ${'53553731'}.
    `('After repeating 10,000 times and 100 phases, $input, $output', ({ input, output }) => {
      const fft = new FFT(input, input.slice(0, 7), 10000);
      expect(fft.value.length).toBe(input.length * 10000);
      expect(fft.offset).toBeLessThan(fft.value.length);

      // TODO: This is still way too slow to run.
      // fft.step(100);

      expect(fft.digitsAtOffset).toBe(output);
    })
  })

  describe('puzzle input', () => {
    test('load from file.', async () => {
      const stream = createStreamFromFile(filename)
      const value = await stream.next();
      const input = value.value;

      const fft = new FFT(input);
      expect(fft.value).toBe(input);
    })
    test('step once', async () => {
      const stream = createStreamFromFile(filename)
      const value = await stream.next();
      const input = value.value;

      const fft = new FFT(input);
      expect(fft.value).toBe(input);
      expect(fft.first8digits).toBe('59718730');
      fft.step();
      expect(fft.first8digits).toBe('18133348');
    })
    test.skip('part 2, input is repeated 10,000 times', async () => {
      const stream = createStreamFromFile(filename)
      const value = await stream.next();
      const input = Array(10000).fill(value.value).join('');

      const fft = new FFT(input);
      expect(fft.value).toBe(input);
      expect(fft.first8digits).toBe('59718730');
      fft.step();
      expect(fft.first8digits).toBe('18133348');
    })
  })
})
