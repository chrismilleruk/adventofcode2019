

class BugLife {
  static async fromStream(linesAsync, bugChar = '#') {
    const lines = [];
    let lineLength = 0;

    for await (const line of linesAsync) {
      let values = line.split('').map((ch, idx) => {
        lineLength = Math.max(lineLength, idx + 1)
        return (ch === bugChar) ? (1 << idx) : 0;
      });

      let lineValue = values.reduce((a, b) => a + b);
      
      lines.push(lineValue);
    }

    return new BugLife(lines, lineLength);
  }

  constructor(lineValues, lineLength) {
    this.lineValues = lineValues;
    this.lineLength = lineLength;
  }

  get biodiversityRating() {
    return this.lineValues.reduce((p, line, idx) => {
      return p + (line << (idx * this.lineLength));
    }, 0);

    // To calculate the biodiversity rating for this layout, consider each tile left-to-right in the top row, 
    // then left-to-right in the second row, and so on. Each of these tiles is worth biodiversity points equal 
    // to increasing powers of two: 1, 2, 4, 8, 16, 32, and so on. Add up the biodiversity points for tiles 
    // with bugs; in this example, the 16th tile (32768 points) and 22nd tile (2097152 points) have bugs, 
    // a total biodiversity rating of 2129920.
  }

  get lines() {
    return this.lineValues.map((lv) => {
      let line = '';
      for (let x = 0; x < this.lineLength; x += 1) {
        line += (lv & 1 << x) ? '#' : '.';
      }
      return line;
    }).join('\n')
  }

  step() {
    // A bug dies (becoming an empty space) unless there is exactly one bug adjacent to it.
    // An empty space becomes infested with a bug if exactly one or two bugs are adjacent to it.
    // Otherwise, a bug or empty space remains the same. (Tiles on the edges of the grid have fewer 
    // than four adjacent tiles; the missing tiles count as empty space.) 
    // This process happens in every location simultaneously; that is, within the same minute, 
    // the number of adjacent bugs is counted for every tile first, and then the tiles are updated.

    // Current ~ Adjacent ~  Future
    //  1         0           0
    //  1         1           1
    //  1         2           0
    //  1         3           0
    //  1         4           0
    // 
    //  0         0           0
    //  0         1           1
    //  0         2           1
    //  0         3           0
    //  0         4           0
    
    this.lineValues = this.lineValues.map((val, idx, arr) => {
      let up = arr[idx - 1] || 0;
      let down = arr[idx + 1] || 0;
      let left = val >> 1;
      let right = val << 1;
      let mask = 1;

      let result = 0;
      for (let i = 0; i < this.lineLength; i += 1) {
        let count = (up & mask) + (down & mask) + (left & mask) + (right & mask);
        // [idx, i, (val >> i) & 1, count];/*?*/
        if (count === 2 && !((val >> i) & 1)) {
          result += (1 << i);
        } else if (count === 1) {
          result += (1 << i);
        }

        up >>= 1;
        down >>= 1;
        left >>= 1;
        right >>= 1;
      }
      return result;
    })

    return this.lineValues;
  }
}

module.exports = { BugLife };