

class FFT {
  constructor(seed) {
    this._seed = seed;
    this.value = seed;
  }

  get first8digits() {
    return this.value.slice(0, 8);
  }

  get digitsAtOffset() {
    const offset = parseInt(this.value.slice(0, 7));
    return this.value.slice(offset, offset + 8);
  }

  step(phases = 1) {
    while (phases--) {
      this.value = this.applyMatrix(this.value);
    }
    return this.value;
  }

  applyMatrix(value) {
    // Input signal: 12345678

    // 1*1  + 2*0  + 3*-1 + 4*0  + 5*1  + 6*0  + 7*-1 + 8*0  = 4
    // 1*0  + 2*1  + 3*1  + 4*0  + 5*0  + 6*-1 + 7*-1 + 8*0  = 8
    // 1*0  + 2*0  + 3*1  + 4*1  + 5*1  + 6*0  + 7*0  + 8*0  = 2
    // 1*0  + 2*0  + 3*0  + 4*1  + 5*1  + 6*1  + 7*1  + 8*0  = 2
    // 1*0  + 2*0  + 3*0  + 4*0  + 5*1  + 6*1  + 7*1  + 8*1  = 6
    // 1*0  + 2*0  + 3*0  + 4*0  + 5*0  + 6*1  + 7*1  + 8*1  = 1
    // 1*0  + 2*0  + 3*0  + 4*0  + 5*0  + 6*0  + 7*1  + 8*1  = 5
    // 1*0  + 2*0  + 3*0  + 4*0  + 5*0  + 6*0  + 7*0  + 8*1  = 8

    // After 1 phase:  48226158
    // After 2 phases: 34040438
    // After 3 phases: 03415518
    // After 4 phases: 01029498

    // Get Digits as an array.
    const digits = String(value).split('').map(s => parseInt(s, 10));
    while (digits.length < this._seed.length) {
      digits.unshift(0);
    }
    // digits = [ 1, 2, 3, 4, 5, 6, 7, 8 ]

    const length = digits.length;
    const output = Array(length);
    for (let row = 0; row < length; row = row + 1) {
      // row;/*?*/
      let total = 0;
      for (let col = 0; col < length; col = col + 1) {
        // [row, col];/*?*/
        const multiplier = getMultiplier(row, col);
        total += (digits[col] * multiplier)
      }

      // Then, only the ones digit is kept: 38 becomes 8, -17 becomes 7, and so on.
      const digit = Math.abs(total) % 10;
      if (length > 1000) process.stdout.write(String(digit));
      output[row] = digit;
    }

    const result = output.join('');
    return result;
  }
}

function getMultiplier(row, col) {
  // The base pattern is 0, 1, 0, -1.
  const basePattern = [0, 1, 0, -1];

  // When applying the pattern, skip the very first value exactly once. 
  // (In other words, offset the whole pattern left by one.) So, for the 
  // second element of the output list, the actual pattern used would be: 
  // 0, 1, 1, 0, 0, -1, -1, 0, 0, 1, 1, 0, 0, -1, -1, ....
  const col1 = col + 1;
  const row1 = row + 1;
  
  // Then, repeat each value in the pattern a number of times equal to the 
  // position in the output list being considered. Repeat once for the first
  // element, twice for the second element, three times for the third element, 
  // and so on. So, if the third element of the output list is being calculated, 
  // repeating the values would produce: 0, 0, 0, 1, 1, 1, 0, 0, 0, -1, -1, -1.

  // const numRepeats = row1;
  // const seqLength = basePattern.length * numRepeats;

  // const seqPos = (col1 % seqLength);
  // const baseIndex = Math.floor(seqPos / numRepeats);
  
  const patternIndex = (Math.floor(col1 / row1) % (4 * row1)) % 4;

  // [row, col, seqLength, seqPos, baseIndex, patternIndex, basePattern[baseIndex]];/*?*/

  return basePattern[patternIndex];
}

module.exports = { FFT };
