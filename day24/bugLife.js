

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
    this.levels = new Map();

    this.levels.set(0, this.lineValues);

    // Create a lookup to determine number of bugs / bits per line value.
    this.numBitsLookup = [];
    let j = 1 << this.lineLength;
    for (let i = 0; i < j; i += 1) {
      let bits = i;
      let count = 0;
      while (bits > 0) {
        bits = bits & (bits - 1);
        count += 1;
      }
      this.numBitsLookup[i] = count;
    }
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

  get linesRecursive() {
    return new Map([...this.levels].map(([key, val]) => {
      val = val.map((lv, y) => {
        let line = '';
        for (let x = 0; x < this.lineLength; x += 1) {
          if (x == 2 && y == 2) {
            line += '?';
            continue;
          }
          line += (lv & 1 << x) ? '#' : '.';
        }
        return line;
      }).join('\n');

      return [key, val];
    }));
  }

  get totalBugs() {
    // Count each line of each level.  
    let total = 0;
    for (const level of this.levels.values()) {
      for (let line of level) {
        total += this.numBitsLookup[line]
      }
    }

    return total;
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

  stepRecursive() {
    //      |     |         |     |     
    //   1  |  2  |    3    |  4  |  5  
    //      |     |         |     |     
    // -----+-----+---------+-----+-----
    //      |     |         |     |     
    //   6  |  7  |    8    |  9  |  10 
    //      |     |         |     |     
    // -----+-----+---------+-----+-----
    //      |     |A|B|C|D|E|     |     
    //      |     |-+-+-+-+-|     |     
    //      |     |F|G|H|I|J|     |     
    //      |     |-+-+-+-+-|     |     
    //  11  | 12  |K|L|?|N|O|  14 |  15 
    //      |     |-+-+-+-+-|     |     
    //      |     |P|Q|R|S|T|     |     
    //      |     |-+-+-+-+-|     |     
    //      |     |U|V|W|X|Y|     |     
    // -----+-----+---------+-----+-----
    //      |     |         |     |     
    //  16  | 17  |    18   |  19 |  20 
    //      |     |         |     |     
    // -----+-----+---------+-----+-----
    //      |     |         |     |     
    //  21  | 22  |    23   |  24 |  25 
    //      |     |         |     |     

    const levelKeys = [...this.levels.keys()];
    const lowestLevel = Math.min(...levelKeys) - 1;
    const highestLevel = Math.max(...levelKeys) + 1;

    // lowestLevel;
    // highestLevel;

    const newLevels = new Map();

    for (let level = lowestLevel; level <= highestLevel; level += 1) {
      let levelValues = this.levels.get(level) || [0, 0, 0, 0, 0];
      let outerValues = this.levels.get(level - 1) || [0, 0, 0, 0, 0];
      let innerValues = this.levels.get(level + 1) || [0, 0, 0, 0, 0];

      let outer8 = 1 & (outerValues[1] >> 2);
      let outer18 = 1 & (outerValues[3] >> 2);

      // Row is stored in reverse order so shift works right to left: 
      // e.g.  1, 2, 4, 8, 16 
      // shift 0, 1, 2, 3, 4
      let outer12 = 1 & (outerValues[2] >> 1);
      let outer14 = 1 & (outerValues[2] >> 3);
       
      outer8 = outer8 * (Math.pow(2, this.lineLength) - 1);
      outer18 = outer18 * (Math.pow(2, this.lineLength) - 1);
      outer14 = outer14 << this.lineLength - 1;

      if (level === 1) [outer8, outer18, outer12, outer14]/*?*/

      levelValues = levelValues.map((val, row_idx, arr) => {
        // Row is stored in reverse order: 
        // 1, 2, 4, 8, 16 
        let up = row_idx === 0 ? outer8 : arr[row_idx - 1];
        let down = row_idx === this.lineLength - 1 ? outer18 : arr[row_idx + 1];
        let left = (val << 1) + outer12;
        let right = (val >> 1) + outer14;

        let mask = 1;
        let result = 0;
        for (let col_idx = 0; col_idx < this.lineLength; col_idx += 1) {
          let count = (up & mask) + (down & mask) + (left & mask) + (right & mask);

          if ([1, 3].includes(row_idx) && col_idx === 2) {
            // Add top/bottom row from inner.
            let innerLine = row_idx === 1 ? innerValues[0] : innerValues[4];
            count += this.numBitsLookup[innerLine];

          } else if (row_idx === 2 && [1, 3].includes(col_idx)) {
            // Add left/right col from inner. 
            let mask = col_idx === 1 ? 1 : 1 << (this.lineLength - 1);
            for (let i = 0; i < this.lineLength; i += 1) {
              if (innerValues[i] & mask) {
                count += 1;
              }
            }
          }

          if (row_idx === 2 && col_idx === 2) {
            // skip this because the center tile is replaced with the recursive inner grid.
          } else if (count === 2 && !((val >> col_idx) & 1)) {
            result += (1 << col_idx);
          } else if (count === 1) {
            result += (1 << col_idx);
          }

          up >>= 1;
          down >>= 1;
          left >>= 1;
          right >>= 1;
        }
        return result;
      });

      if (levelValues.some(v => v)) {
        newLevels.set(level, levelValues);
      }
    }

    this.levels = newLevels;
    this.lineValues = newLevels.get(0);
  }

}

module.exports = { BugLife };