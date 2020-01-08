
class CardDeck {
  constructor(count) {
    this.cards = new Array(count).fill(0).map((v, i) => i);
  }

  dealIntoNewStack() {
    this.cards.reverse();
    return this.cards;
  }

  dealWithIncrement(n) {
    let arr = new Array(this.cards.length);
    this.cards.forEach((v, idx) => {
      idx = (idx * n) % arr.length;
      arr[idx] = v;
      // idx = (arr.length - idx) % arr.length;
      // return arr[idx];
    })
    this.cards = arr;
    return this.cards;
    // For example, to deal with increment 3:


    // 0 1 2 3 4 5 6 7 8 9   Your deck
    // . . . . . . . . . .   Space on table
    // ^                     Current position
    
    // Deal the top card to the current position:
    
    //   1 2 3 4 5 6 7 8 9   Your deck
    // 0 . . . . . . . . .   Space on table
    // ^                     Current position
    
    // Move the current position right 3:
    
    //   1 2 3 4 5 6 7 8 9   Your deck
    // 0 . . . . . . . . .   Space on table
    //       ^               Current position
    
    // Deal the top card:
    
    //     2 3 4 5 6 7 8 9   Your deck
    // 0 . . 1 . . . . . .   Space on table
    //       ^               Current position
    
    // Move right 3 and deal:
    
    //       3 4 5 6 7 8 9   Your deck
    // 0 . . 1 . . 2 . . .   Space on table
    //             ^         Current position
    
    // Move right 3 and deal:
    
    //         4 5 6 7 8 9   Your deck
    // 0 . . 1 . . 2 . . 3   Space on table
    //                   ^   Current position
    
    // Move right 3, wrapping around, and deal:
    
    //           5 6 7 8 9   Your deck
    // 0 . 4 1 . . 2 . . 3   Space on table
    //     ^                 Current position
    
    // And so on:
    
    // 0 7 4 1 8 5 2 9 6 3   Space on table
  }

  cut(n) {
    if (n > 0) {
      // Top          Bottom
      // 0 1 2 3 4 5 6 7 8 9   Your deck
      
      //       3 4 5 6 7 8 9   Your deck
      // 0 1 2                 Cut cards
      
      // 3 4 5 6 7 8 9         Your deck
      //               0 1 2   Cut cards
      
      // 3 4 5 6 7 8 9 0 1 2   Your deck

      let cards = this.cards.splice(0, n);
      this.cards.push(...cards);
    } else {
      // Top          Bottom
      // 0 1 2 3 4 5 6 7 8 9   Your deck
  
      // 0 1 2 3 4 5           Your deck
      //             6 7 8 9   Cut cards
  
      //         0 1 2 3 4 5   Your deck
      // 6 7 8 9               Cut cards
  
      // 6 7 8 9 0 1 2 3 4 5   Your deck
      let cards = this.cards.splice(n);
      this.cards.unshift(...cards);
    }
    return this.cards;
  }
}

class Shuffler {
  constructor(count) {
    this.deck = new CardDeck(count);
  }

  async shuffle(linesAsync) {
    for await (const cards of this.shuffleIterator(linesAsync)) {
      cards/*?*/
    }
    return this.deck.cards;
  }

  async* shuffleIterator(linesAsync) {
    for await (const line of linesAsync) {
      let words = line.split(' ');
      let cards;
      if (line === 'deal into new stack') {
        cards = this.deck.dealIntoNewStack();
      } else if (words[0] === 'deal') {
        // deal with increment 32
        let n = parseInt(words[3], 10);
        cards = this.deck.dealWithIncrement(n);
      } else if (words[0] === 'cut') {
        // cut 5214
        let n = parseInt(words[1], 10);
        cards = this.deck.cut(n);
      } else {
        throw `unknown shuffle command '${line}'`;
      }
      yield [line, cards];
    }
  }
}

module.exports = { CardDeck, Shuffler };