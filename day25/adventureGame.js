const { loadIntcodeFile } = require('../lib/loadIntcode');
const { chunksToLines, charCodeToChar } = require('../lib/createStream');
const { executeProgramAsGenerator } = require('../lib/intCodeComputer');
const { EventEmitter } = require('events');

// Interactive mode.
const { getChoice } = require('../lib/interactive');
const { Panel, renderAllPanels, YAXIS, calculateMinMax, preparePlotArea, plotPanels, plotPanelAsBlock } = require('../lib/render');
const readline = require('readline');
const chalk = require('chalk');

class AdventureGame extends EventEmitter {
  static async fromFile(filename) {
    const program = await loadIntcodeFile(filename);
    return new AdventureGame(program);
  }

  constructor(program) {
    super();

    this._program = program;

    this.state = {
      doors: [],
      items: [],
      inv: [],
      attempts: []
    };
    this.getDoorChar = (name) => name[0];
    this.getItemChar = (name) => this.state.items.indexOf(name) + 1;
    this.getInvChar = (name) => this.state.inv.indexOf(name) + this.state.items.length + 2;

    this.rxRoom = new RegExp(/== (.*) ==/);
    this.rxDoors = new RegExp(/Doors here lead:/);
    this.rxItems = new RegExp(/Items here:/);
    this.rxInventory = new RegExp(/Items in your inventory:/);
    this.rxListItem = new RegExp(/- (.*)/);
    this.rxTaken = new RegExp(/You take the (.*)./);
    this.rxDropped = new RegExp(/You drop the (.*)./);
    this.rxPressureTest = new RegExp(/A loud, robotic voice says "Alert! Droids on this ship are (lighter|heavier) than the detected value!" and you are ejected back to the checkpoint./);
    this.rxAirlockCode = new RegExp(/You should be able to get in by typing (\d+) on the keypad at the main airlock/);
    this.rxBadItems = new RegExp(/(giant electromagnet|infinite loop|escape pod|photons|molten lava)/);
  }

  interpretItem(line) {
    if (this.rxListItem.test(line)) {
      const item = line.match(this.rxListItem)[1];

      // Don't push to the inventory if the item already exists.
      if (this._currentList === this.state.inv) {
        if (this._currentList.indexOf(item) > -1) {
          return '☑️';
        }
      }

      this._currentList.push(item);
      const char = this._currentGetChar(item);

      if (this._currentList === this.state.doors) {
        this.emit('door', item, this.state);
      }

      if (this.rxBadItems.test(line)) {
        return '⚠️';
      }

      return char || '➕';
    }
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
      return this.interpretItem(line);
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
      this.state.items.length = 0;
      this.state.doors.length = 0;
      return '⭐️';
    }
    
    if (this.rxDoors.test(line)) {
      this.state.doors.length = 0;
      this._currentList = this.state.doors;
      this._currentGetChar = this.getDoorChar;
      return '🚪';
    }
    
    if (this.rxItems.test(line)) {
      this.state.items.length = 0;
      this._currentList = this.state.items;
      this._currentGetChar = this.getItemChar;
      return '🎲';
    }
    
    if (this.rxInventory.test(line)) {
      this._currentList = this.state.inv;
      this._currentGetChar = this.getInvChar;
      return '💼';
    }
    
    if (this.rxPressureTest.test(line)) {
      const result = line.match(this.rxPressureTest)[1];
      const attempt = {
        inv: this.state.inv.slice(),
        result: result
      };
      this.state.attempts.push(attempt);
      return '🧪';
    }
    
    if (this.rxAirlockCode.test(line)) {
      const result = line.match(this.rxAirlockCode)[1];
      this.state.airlockCode = result;
      return '🔑';
    }

    function remove(arr, item) {
      const idx = arr.indexOf(item);
      if (idx > -1) arr.splice(idx, 1);
    }

    return '→';
  }

  getRelCoord(direction, distance = 1) {
    const c = this._coord;
    switch (direction) {
      case 'north':
        return [c[0], c[1] - distance];
      case 'south':
        return [c[0], c[1] + distance];
      case 'east':
        return [c[0] + distance, c[1]];
      case 'west':
        return [c[0] - distance, c[1]];
    }
    return c;
  }

  async interactiveMode(writeLine, readLine = this.getReadLineFn()) {
    this._panels = new Map();
    this._coord = [0, 0];
    const panel = new Panel(this._coord[0], this._coord[1], 1);
    this._panels.set(String(panel.coord), panel);

    this.bindEvents();

    let inputs = [];

    const inputFn = async () => {
      if (inputs.length === 0) {
        const line = await readLine(this.state);

        if (['north', 'south', 'east', 'west'].indexOf(line) > -1) {
          this.emit('move', line, this.state);
        }
        
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

    return this.state;
  }

  bindEvents() {
    this.on('door', (doorName, state) => {
      const coord = this.getRelCoord(doorName, 1);
      const panel = new Panel(coord[0], coord[1], 1);
      this._panels.set(String(panel.coord), panel);
    });

    this.on('move', (doorName, state) => {
      const coord = this.getRelCoord(doorName, 2);
      const panel = new Panel(coord[0], coord[1], 1);
      this._panels.set(String(panel.coord), panel);
      this._coord = coord;
    })
  }

  getReadLineFn() {

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const readLine = async (state) => {
      // Render the map
      await this.renderMap();

      const choices = this.getChoices(state, rl);
      try {
        const choice = await getChoice(choices, rl);
        return await choice.command();
      } catch (ex) {
        return new Promise((resolve) => {
          rl.question('Free text >', (answer) => {
            rl.pause();
            console.log(chalk.red(answer));
            resolve(answer)
          });
        })
      }
    }

    return readLine;
  }

  getChoices(state, rl) {
    let choices = [];
    // {title: '', command: () => ''}
    // {
    //   inv: [ 'sand' ],
    //   room: 'Arcade',
    //   items: [],
    //   doors: [ 'north', 'south' ]
    // }

    for (const doorName of state.doors) {
      choices.push({
        title: `Go ${doorName}`, 
        command: () => doorName,
        key: this.getDoorChar(doorName)
      })
    }

    for (const itemName of state.items) {
      choices.push({
        title: `Take ${itemName}`, 
        command: () => `take ${itemName}`,
        key: this.getItemChar(itemName)
      })
    }

    for (const itemName of state.inv) {
      choices.push({
        title: `Drop ${itemName}`, 
        command: () => `drop ${itemName}`,
        key: this.getInvChar(itemName)
      })
    }

    choices.push({
      title: `Inventory`,
      command: () => `inv`,
      key: 'i'
    })

    choices.push({
      title: `Review Attempts`,
      command: () => {
        for (const attempt of state.attempts) {
          const items = attempt.inv.join(', ');
          const color = attempt.result === 'heavier' ? chalk.yellow : chalk.blue;
          console.log(color(`other droids are ${attempt.result} than you with`), color(items || 'nothing'));
        }
        return `inv`;
      },
      key: 'k'
    })

    choices.push({
      title: `See map`,
      command: async () => {
        await this.renderMap();
        return `inv`;
      },
      key: 'm'
    })

    // const freetext = {
    //   title: 'type command',
    //   command: () => new Promise((resolve) => {
    //     rl.question('Type command >', (answer) => {
    //       rl.pause();
    //       console.log(chalk.red(answer));
    //       resolve(answer)
    //     });
    //   })
    // }
    // choices.push(freetext);

    return choices;

  }

  async renderMap() {
    const { width, height, offset, halfWidth, halfHeight } = calculateMinMax(this._panels);

    // Draw box outline
    const renderer = preparePlotArea(process.stdout, halfWidth, halfHeight, YAXIS.TOP_TO_BOTTOM);
    
    // Plot all panels
    const blocks = new Map();

    for (const panel of this._panels) {
      plotPanelAsBlock(renderer, panel[1], blocks, offset);
    }

    let panel = new Panel(this._coord[0], this._coord[1], 1);
    plotPanelAsBlock(renderer, panel, blocks, offset, { color: chalk.red, value: 1 })

    renderer.close();
  }
}


module.exports = { AdventureGame };