
const ONE_TRILLION = 1000000000000;

class NanoFactory {

  static async parseStream(linesAsync, oreAvailable) {
    const factory = new NanoFactory(oreAvailable);
    for await (const line of linesAsync) {
      const reaction = Reaction.parse(line);
      factory.addReaction(reaction);
    }
    return factory;
  }

  constructor(oreAvailable = ONE_TRILLION) {
    this._reactions = new Map();
    this._fuelProduced = 0;
    this._oreUsed = 0;
    this._oreAvailable = oreAvailable;
  }

  addReaction(reaction) {
    reaction.factory = this;
    this._reactions.set(reaction.output.element, reaction);
  }

  getReaction(element) {
    if (element === 'ORE') {
      return { produceOutput: (units) => this.produceOre(units) };
    }

    const elementReaction = this._reactions.get(element);
    if (!elementReaction) {
      throw `${element} not found`
    }
    return elementReaction;
  }

  produceAllFuel() {
    return this.produceFuel(ONE_TRILLION);
  }

  produceFuel(units) {
    const produced = this.produceElement(units, 'FUEL');
    this._fuelProduced += produced.units;
    return produced;
  }

  produceElement(units, element) {
    if (element === 'ORE') {
      return this.produceOre(units);
    }

    const elementReaction = this.getReaction(element);
    const partial = (element === 'FUEL');
    return elementReaction.produceOutput(units, partial);
  }

  produceOre(units) {
    const element = 'ORE';

    if (this._oreAvailable < units) {
      return { units: 0, element };
    }

    this._oreAvailable -= units;
    this._oreUsed += units;
    return { units, element };
  }

  get fuelProduced() {
    return this._fuelProduced;
  }

  get oreUsed() {
    return this._oreUsed;
  }

  get waste() {
    return [...this._reactions.values()].filter(r => r.stock > 0).map(r => {
      return {
        units: r.stock,
        element: r.output.element
      }
    })
  }
}

class Reaction {
  static parse(description) {
    // 7 A, 1 B => 1 C
    const [inputStr, outputStr] = description.split('=>');

    const inputs = inputStr.split(',').map(parseQuant);
    const output = parseQuant(outputStr);

    return new Reaction(output, inputs, description);

    function parseQuant(str) {
      // 1 C
      const parts = str.trim().split(' ');
      return {
        units: parseInt(parts[0], 10),
        element: parts[1].trim()
      };
    }
  }

  constructor(output, inputs, description) {
    this._inputs = inputs;
    this._output = output;
    this._stock = 0;
  }

  get element() {
    return this._output.element;
  }
  
  /**
   * @param {NanoFactory} factory
   */
  set factory(factory) {
    this._factory = factory;
  }

  get inputs() {
    if (!this._factory) throw 'factory not set.';
    return this._inputs.map((input) => {
      input.reaction = this._factory.getReaction(input.element);
      return input;
    })
  }

  get output() {
    return this._output;
  }

  get stock() {
    return this._stock;
  }

  getReaction(element) {
    if (!this._factory) throw 'factory not set.';
    return this._factory.getReaction(element);
  }

  singleReaction() {
    const mixingBowl = [];

    for (const input of this.inputs) {
      const reactionResult = input.reaction.produceOutput(input.units);
      mixingBowl.push(reactionResult);

      // Check if input reaction failed to produce the requested amount of chemicals.
      if (reactionResult.units < input.units) {

        // Return unused elements to their reaction stock.
        let item;
        while (item = mixingBowl.pop()) {
          if (item.reaction) {
            item.reaction.returnElements(item.units);
          }
        }
        
        break;
      }
    }

    // If we have nothing in the mixing bowl the reaction failed.
    return mixingBowl.length > 0;
  } 

  /**
   * 
   * @param {Number} unitsRequested 
   */
  produceOutput(unitsRequested) {
    // If we don't have enough in stock produce some more until we do.
    while (this._stock < unitsRequested) {
      
      if (!this.singleReaction()) {
        // If the reaction failed, we can return only as many units as we have in stock.
        unitsRequested = this._stock;
        break;
      }

      // If the reaction worked, we can add a fixed amount of output chemicals to our stock.
      this._stock += this._output.units;
    }

    // Remove the demand from the stock.
    this._stock -= unitsRequested;

    return { units: unitsRequested, element: this.element, reaction: this };
  }

  /**
   * Return unused elements to our stock.
   * @param {Number} units 
   */
  returnElements(units) {
    this._stock += units;
  }
}


module.exports = { NanoFactory };

