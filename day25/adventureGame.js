const { loadIntcodeFile } = require('../lib/loadIntcode');
const { chunksToLines, charCodeToChar } = require('../lib/createStream');
const { executeProgramAsGenerator } = require('../lib/intCodeComputer');
const { getChoice } = require('../lib/interactive');


class AdventureGame {
  static async fromFile(filename) {
    const program = await loadIntcodeFile(filename);
    return new AdventureGame(program);
  }

  constructor(program) {
    this._program = program;

    this.state = {
      inv: []
    };

    this.rxRoom = new RegExp(/== (.*) ==/);
    this.rxDoors = new RegExp(/Doors here lead:/);
    this.rxItems = new RegExp(/Items here:/);
    this.rxInventory = new RegExp(/Items in your inventory:/);
    this.rxListItem = new RegExp(/- (.*)/);
    this.rxTaken = new RegExp(/You take the (.*)./);
    this.rxDropped = new RegExp(/You drop the (.*)./);
    this.rxPressureTest = new RegExp(/A loud, robotic voice says "Alert! Droids on this ship are (lighter|heavier) than the detected value!" and you are ejected back to the checkpoint./);
  }

  interpretLine(line) {
    if (line === '') {
      if (this._currentList) {
        this._currentList = {
          push: (item) => {
            throw `cannot push item ${item}`;
          }
        };
      }
      return '';
    }

    if (this.rxListItem.test(line)) {
      const item = line.match(this.rxListItem)[1];
      if (this._currentList === this.state.inv) {
        if (this._currentList.indexOf(item) > -1) {
          return '☑️';
        }
      }
      this._currentList.push(item);
      return '➕';
    }

    if (this.rxTaken.test(line)) {
      const item = line.match(this.rxTaken)[1];
      this.state.inv.push(item);
      remove(this.state.items, item)
      return '🔼';
    }

    if (this.rxDropped.test(line)) {
      const item = line.match(this.rxDropped)[1];
      this.state.items.push(item);
      remove(this.state.inv, item)
      return '🔽';
    }

    if (this.rxRoom.test(line)) {
      this.state.room = line.match(this.rxRoom)[1];
      this.state.items = [];
      this.state.doors = [];
      return '⭐️';
    }
    
    if (this.rxDoors.test(line)) {
      this.state.doors = [];
      this._currentList = this.state.doors;
      return '🚪';
    }
    
    if (this.rxItems.test(line)) {
      this.state.items = [];
      this._currentList = this.state.items;
      return '🎲';
    }
    
    if (this.rxInventory.test(line)) {
      this._currentList = this.state.inv;
      return '💼';
    }

    function remove(arr, item) {
      const idx = arr.indexOf(item);
      if (idx > -1) arr.splice(idx, 1);
    }

    return '→';
  }

  async interactiveMode(writeLine, readLine) {
    let inputs = [];

    const inputFn = async () => {
      if (inputs.length === 0) {
        const line = await readLine(this.state);
        const chars = line.split('').map(s=>s.charCodeAt(0));
        inputs = chars;
        inputs.push(10);
      }
      const input = inputs.shift();
      
      return input;
    }
    const outputs = [];
    
    const generator = executeProgramAsGenerator(this._program.slice(), inputFn);
    const charsAsync = charCodeToChar(generator);
    const linesAsync = chunksToLines(charsAsync, false, false);
    for await (let line of linesAsync) {
      const interpretation = this.interpretLine(line);
      outputs.push(line);
      writeLine(line, this.state, interpretation);
    }

    return outputs[0];
  }
}


module.exports = { AdventureGame };