

class NanoFactory {

  static async parseStream(linesAsync) {
    const factory = new NanoFactory();
    for await (const line of linesAsync) {
      const reaction = Reaction.parse(line);
      factory.addReaction(reaction);
    }
    return factory;
  }

  constructor() {
    this._reactions = new Map();
    this._oreUsed = 0;
  }

  addReaction(reaction) {
    reaction.onRequest = (units, element) => this.produceElement(units, element);
    this._reactions.set(reaction.output.element, reaction);
  }

  produceFuel(units) {
    return this.produceElement(units, 'FUEL');
  }

  produceElement(units, element) {
    if (element === 'ORE') {
      this._oreUsed += units;
      return;
    }

    const fuelReaction = this._reactions.get(element);
    if (!fuelReaction) {
      throw `${element} not found`
    }
    return fuelReaction.produceOutput(units);
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

  produceOutput(units) {
    this._stock -= units;
    while (this._stock < 0) {
      for (const input of this._inputs) {
        input/*?*/
        this.onRequest(input.units, input.element);
      }
      this._stock += this._output.units;
    }
    return { units, element: this._output.element };
  }
}


module.exports = { NanoFactory };
