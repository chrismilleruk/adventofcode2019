

class FFT {
  constructor(seed) {
    this._seed = seed;
    this.value = seed;
    this.matrix = createMatrix(String(seed).length);
  }

  get first8digits() {
    return this.value.slice(0,8);
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
    while (digits.length < this.matrix.length) {
      digits.unshift(0);
    }
    // digits = [ 1, 2, 3, 4, 5, 6, 7, 8 ]

    const output = this.matrix.map((row) => {
      let val = row.reduce((total, multiplier, index) => {
        return total + (digits[index] * multiplier)
      }, 0)

      // Then, only the ones digit is kept: 38 becomes 8, -17 becomes 7, and so on.
      return Math.abs(val) % 10;
    })

    const result = output.join('');
    return result;/*?*/
  }
}

function createMatrix(size) {
  let matrix = Array(size).fill(Array(size+1).fill(0));

  // The base pattern is 0, 1, 0, -1.
  const basePattern = [0, 1, 0, -1];

  matrix = matrix.map((array, row) => {
    // Then, repeat each value in the pattern a number of times equal to the 
    // position in the output list being considered. Repeat once for the first
    // element, twice for the second element, three times for the third element, 
    // and so on. So, if the third element of the output list is being calculated, 
    // repeating the values would produce: 0, 0, 0, 1, 1, 1, 0, 0, 0, -1, -1, -1.
    const numRepeats = row + 1;
    const seqLength = 4 * numRepeats;
    array = array.map((_, col) => {
      const seqPos = (col % seqLength);
      const baseIndex = Math.floor(seqPos / numRepeats);

      // [row, col, seqLength, seqPos, baseIndex, basePattern[baseIndex]];/*?*/

      return basePattern[baseIndex];
    })

    // When applying the pattern, skip the very first value exactly once. 
    // (In other words, offset the whole pattern left by one.) So, for the 
    // second element of the output list, the actual pattern used would be: 
    // 0, 1, 1, 0, 0, -1, -1, 0, 0, 1, 1, 0, 0, -1, -1, ....
    array.shift();

    return array;
  });

  return matrix;
}

module.exports = { FFT };
