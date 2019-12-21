const { FFT } = require('./fft')
const { createStreamFromFile } = require('../lib/createStream');
const filename = __dirname + '/input.txt';

describe('Flawed Frequency Transmission', () => {
  describe('Examples', () => {
    test.only('Input signal: 12345678', () => {
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
    `('After 1000 phases, $input, $output', ({ input, output }) => {
      const fft = new FFT(input);
      expect(fft.value).toBe(input);

      fft.step(100);

      expect(fft.first8digits).toBe(String(output));
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
