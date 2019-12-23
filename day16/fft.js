

class FFT {
  constructor(seed, offset = 0, numRepeats = 1) {
    if (numRepeats > 1) {
      seed = Array(10000).fill(seed).join('');
    }
    if (!Array.isArray(seed)) {
      seed = [...seed];
    }
    this._seed = seed;
    this._numRepeats = numRepeats;
    this._value = seed;
    this.offset = offset;
  }

  get first7digits() {
    return this._value.slice(0, 7).join('');
  }

  get first8digits() {
    return this._value.slice(0, 8).join('');
  }

  set offset(offset) {
    if (Array.isArray(offset)) {
      offset = offset.join('');
    }
    if (typeof offset === "string") {
      offset = parseInt(offset, 10);
    }
    this._offset = offset;
  }

  get offset() {
    return this._offset;
  }

  get value () {
      return this._value.join('')
  }

  get digitsAtOffset() {
    return this._value.slice(this._offset, this._offset + 8).join('');
  }

  step(phases = 1) {
    while (phases--) {
      this._value = this.applyMatrix(this._value);
    }
    return this._value;
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
    // const digits = String(value).split('').map(s => parseInt(s, 10));
    // while (digits.length < this._seed.length) {
    //   digits.unshift(0);
    // }
    // digits = [ 1, 2, 3, 4, 5, 6, 7, 8 ]

    const length = value.length;
    const output = Array(length).fill(0);
    for (let row = this._offset; row < length; row = row + 1) {
      // row;/*?*/
      let digit = calcDigit(value, row);
      
      // Then, only the ones digit is kept: 38 becomes 8, -17 becomes 7, and so on.
      // const digit = Math.abs(total) % 10;
      if (length > 1000) process.stdout.write(String(digit));
      output[row] = digit;
    }

    const result = output;//.join('');
    while (result.length < this._seed.length) {
      result.unshift(0);
    }
    return result;
  }
}

function calcDigit(digits, row) {
  const basePattern = [0, 1, 0, -1];
  const limit = digits.length;
  const row1 = row + 1;

  let startIdx = row;
  let endIdx = row + row1;
  let total = 0;
  let minusOne = false;

  while (startIdx < limit) {
    endIdx = Math.min(endIdx, limit);
    for (let i = startIdx; i < endIdx; i++) {
      if (!minusOne) {
        total += parseInt(digits[i], 10);
      } else {
        total -= parseInt(digits[i], 10);
      }
    }

    startIdx += row1 * 2;
    endIdx += row1 * 2;
    minusOne = !minusOne;
  }

  return Math.abs(total) % 10;
}

// function* genMultiplier(row, limit) {
//   // The base pattern is 0, 1, 0, -1.
//   const basePattern = [0, 1, 0, -1];

//   // When applying the pattern, skip the very first value exactly once. 
//   // (In other words, offset the whole pattern left by one.) So, for the 
//   // second element of the output list, the actual pattern used would be: 
//   // 0, 1, 1, 0, 0, -1, -1, 0, 0, 1, 1, 0, 0, -1, -1, ....
//   const row1 = row + 1;
//   let col = -1;
//   let patternIndex = 0;
//   let repeatIndex = 0;

//   while (limit--) {
//     col += 1;
//     repeatIndex += 1;
//     if (repeatIndex >= row1) {
//       repeatIndex = 0;
//       patternIndex += 1;
//       if (patternIndex >= 4) {
//         patternIndex = 0;
//       }
//     }

//     yield { col, multiplier: basePattern[patternIndex] };
//   }
// }

// function getMultiplier(row, col) {
//   // The base pattern is 0, 1, 0, -1.
//   const basePattern = [0, 1, 0, -1];

//   // When applying the pattern, skip the very first value exactly once. 
//   // (In other words, offset the whole pattern left by one.) So, for the 
//   // second element of the output list, the actual pattern used would be: 
//   // 0, 1, 1, 0, 0, -1, -1, 0, 0, 1, 1, 0, 0, -1, -1, ....
//   const col1 = col + 1;
//   const row1 = row + 1;

//   // Then, repeat each value in the pattern a number of times equal to the 
//   // position in the output list being considered. Repeat once for the first
//   // element, twice for the second element, three times for the third element, 
//   // and so on. So, if the third element of the output list is being calculated, 
//   // repeating the values would produce: 0, 0, 0, 1, 1, 1, 0, 0, 0, -1, -1, -1.

//   // const numRepeats = row1;
//   // const seqLength = basePattern.length * numRepeats;

//   // const seqPos = (col1 % seqLength);
//   // const baseIndex = Math.floor(seqPos / numRepeats);

//   const patternIndex = (Math.floor(col1 / row1) % (4 * row1)) % 4;

//   // [row, col, seqLength, seqPos, baseIndex, patternIndex, basePattern[baseIndex]];/*?*/

//   return basePattern[patternIndex];
// }

module.exports = { FFT };
