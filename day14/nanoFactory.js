
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
    reaction.onRequest = (units, element) => this.produceElement(units, element);
    this._reactions.set(reaction.output.element, reaction);
  }

  produceRemainingFuel() {
    return this.produceFuel(ONE_TRILLION);
  }

  produceFuel(units) {
    const produced = this.produceElement(units, 'FUEL');
    this._fuelProduced += produced.units;
    return produced;
  }

  produceElement(units, element) {
    if (element === 'ORE') {
      if (this._oreAvailable < units) {
        return { units: 0, element };
      }
      this._oreAvailable -= units;
      this._oreUsed += units;
      return { units, element };
    }

    const elementReaction = this._reactions.get(element);
    if (!elementReaction) {
      throw `${element} not found`
    }

    const partial = (element === 'FUEL');
    return elementReaction.produceOutput(units, partial);
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
    this.onRequest = () => { throw `Reaction ${description}: onRequest not set.` };
  }

  get output() {
    return this._output;
  }

  get stock() {
    return this._stock;
  }

  produceOutput(units, producePartialOutput = false) {
    while (this._stock < units) {

      // If we don't have enough in stock produce some more.
      for (const input of this._inputs) {
        const produceInput = this.onRequest(input.units, input.element);

        if (produceInput.units < input.units) {
          // One of our inputs failed to produce the requested amount of chemicals.
          const output = { units: 0, element: this._output.element };
          if (producePartialOutput) {
            // We cannot produce any more output than we have already accrued in stock.
            output.units = this._stock;
            this._stock = 0;
          }
          return output;
        }
      }

      // If we got all the inputs, we can add a fixed amount of output chemicals to our stock.
      this._stock += this._output.units;
    }


    // this._stock = unitsProduced - units;
    this._stock -= units;
    return { units, element: this._output.element };
  }
}


module.exports = { NanoFactory };
