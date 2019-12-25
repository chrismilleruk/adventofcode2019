/**
 * The Render module, makes it easy to output simple block graphics at quarter size.
 * 
 * Example:
  ┏━━━━━━━━━━━━━━━━━━━━━━┓
  ┃▗▀▖▛▚▐▀▘ ▜▗▀▖▌ ▐▀▖▛▚  ┃
  ┃▐▗▖▙▞▐▀  ▐▐▄▌▌ ▐▄▘▙▞  ┃
  ┃▝▄▌▌▚▐▄▖▚▞▐ ▌▙▄▐  ▌▚  ┃
  ┗257 ms━━━━━━━━━━━━━━━━┛
 */
const chalk = require('chalk');

/**
* - Takes a `Map` of `Panel`s
* - Works out the extents (min/max for x/y)
* - Draws a box outline
* - Plots each panel at quarter size
* 
* @param {WritableStream} writeStream A writable stream e.g. process.stdout
* @param {Map<string, Panel>} panels 
* @param {YAXIS} yAxis defaults to YAXIS.BOTTOM_TO_TOP
*/
function renderAllPanels(writeStream, panels, yAxis) {
  // Get extents
  const maxSize = { 
    width: writeStream.columns, 
    height: writeStream.rows
  };
  const { width, height, offset, halfWidth, halfHeight } = calculateMinMax(panels);

  if (maxSize.width < halfWidth || maxSize.height < halfHeight) {
    console.error('Not enough room to render', `Need: ${halfWidth} x ${halfHeight}`, `Have: ${maxSize.width} x ${maxSize.height}`);
    return;
  }

  // Draw box outline
  const renderer = preparePlotArea(writeStream, halfWidth, halfHeight, yAxis);
  
  // Plot all panels
  plotPanelsSync(renderer, panels, offset);

  renderer.close(width, 'x', height, 'Offset', offset.x, offset.y);
}

/**
 * 
 * @param {Map<string, Panel>} panels 
 * 
 * @returns { { xMin, xMax, yMin, yMax, offset, width, height, halfWidth, halfHeight } }
 */
function calculateMinMax(panels) {
  let xMin = 0, xMax = 0, yMin = 0, yMax = 0;
  for (const panel of panels.values()) {
    xMin = Math.min(xMin, panel.coord[0]);
    xMax = Math.max(xMax, panel.coord[0]);
    yMin = Math.min(yMin, panel.coord[1]);
    yMax = Math.max(yMax, panel.coord[1]);
  }

  const width = xMax - xMin;
  const height = yMax - yMin;
  const halfWidth = Math.ceil((width + 1) / 2);
  const halfHeight = Math.ceil((height + 1) / 2);
  const offset = {
    x: xMin * -1,
    y: yMin * -1
  };

  return { xMin, xMax, yMin, yMax, offset, width, height, halfWidth, halfHeight };
}

/**
 * 
 * @param {WritableStream} writeStream 
 * @param {Number} width 
 * @param {Number} height 
 * @param {YAXIS} yAxis defaults to YAXIS.BOTTOM_TO_TOP
 * 
 * @returns {Renderer}
 */
function preparePlotArea(writeStream, width, height, yAxis = YAXIS.TOP_TO_BOTTOM) {
  width = Math.ceil(width);
  height = Math.ceil(height);
  // Draw the box outline
  console.log(  '┏' + ''.padEnd(width, '━') + '┓');
  for (let i = height; i--;) {
    console.log('┃' + ''.padEnd(width, ' ') + '┃');
  }
  console.log(  '┗' + ''.padEnd(width, '━') + '┛');

  writeStream.moveCursor(1, -(height + 1)); // top left

  let cursor = {
    screen: { x: 0, y: 0 },
    virtual: { x: -1, y: -1 },
    offset: { x: 0, y: 0 },
    size: { width, height },

    moveTo: (x, y) => {
      x = Math.ceil(x);
      y = Math.ceil(y);
    
      cursor.virtual = { x, y };
      x += cursor.offset.x;
      y += cursor.offset.y;
      if (yAxis == YAXIS.BOTTOM_TO_TOP) {
        y = height - y - 1;
      }

      cursor._moveToInternal(x, y);
    },

    setOffset: (offset) => {
      cursor.offset = offset;
    },

    _moveToInternal: (x, y) => {
      let dx = x - cursor.screen.x;
      let dy = y - cursor.screen.y;
      writeStream.moveCursor(dx, dy);
      cursor.screen = { x, y };
    },

    write: (chars, colorFn = chalk.white) => {
      writeStream.write(colorFn(chars));
      cursor.screen.x += chars.length;
      cursor.virtual.x += chars.length;
    },

    close: (...args) => {
      // Write any console output over the bottom border.
      // e.g.  ┗257 ms━━━━━━━━━━━━━━━━┛
      //       |
      //        ↖ The cursor is left one line below the box.
      cursor._moveToInternal(0, height);
      console.log.apply(console, args);
    },

    clear: () => {
      for (let y = 0; y < height; y += 1) {
        cursor.moveTo(0, y);
        cursor.write(''.padEnd(width, ' '))
      }
      cursor.moveTo(0, 0);
    }
  };

  return cursor;
}

/**
 * An `async` method to plot `Panel`s from a generator.
 * 
 * @param {Renderer} cursor 
 * @param {AsyncGenerator<[string, Panel]>} panelsAsync 
 * @param {{x: Number, y: Number}} offset 
 */
async function plotPanels(cursor, panelsAsync, offset) {
  const blocks = new Map();

  for await (const panel of panelsAsync) {
    plotPanelAsBlock(cursor, panel[1], blocks, offset);
  }
}

/**
 * A sync method to plot `Panel`s from a `Map`
 * 
 * @param {Renderer} cursor 
 * @param {Map<string, Panel>} panels 
 * @param {{x: Number, y: Number}} offset 
 */
function plotPanelsSync(cursor, panels, offset) {
  const blocks = new Map();
  
  for (const panel of panels) {
    plotPanelAsBlock(cursor, panel[1], blocks, offset);
  }
}

/**
 * Takes a `Panel` and renders it at quarter size using the `block` storage provided
 * 
 * @param {Renderer} cursor 
 * @param {Panel} panel 
 * @param {Map<string, Block>} blocks 
 * @param {{x: Number, y: Number}} offset 
 */
function plotPanelAsBlock(cursor, panel, blocks, offset = { x: 0, y: 0 }, color = { color: chalk.white, value: 1 }) {
  const plotCoordX = Math.floor((panel.coord[0] + offset.x) / 2);
  const plotCoordY = Math.floor((panel.coord[1] + offset.y) / 2);
  const blockCoordX = Math.abs(panel.coord[0]) % 2;
  const blockCoordY = Math.abs(panel.coord[1]) % 2;

  const blockKey = `${plotCoordX},${plotCoordY}`;
  let block = blocks.get(blockKey);
  if (!block) {
    block = [
      [0, 0],
      [0, 0]
    ];
    blocks.set(blockKey, block);
  }

  // Set block data to panel color
  block[blockCoordY][blockCoordX] = (panel.color === color.value) ? 1 : 0;

  // Re-render this block.
  cursor.moveTo(plotCoordX, plotCoordY);
  cursor.write(getBlockChar(block), color.color);
}

/**
 * Takes a 2d array and returns a unicode block char such as ▜ or ▚.
 * This allows block graphics to be drawn in an area 50% x 50%.
 * 
 * @param {Block} block A 2D array that describes the block. e.g.
 * [
 *  [0, 1],
 *  [1, 0]
 * ]
 * 
 * @returns a single unicode character e.g. '▞'
 */
function getBlockChar(block) {
  //  	    0	1	2	3	4	5	6	7	8	9	A	B	C	D	E	F
  // U+258x	▀	▁	▂	▃	▄	▅	▆	▇	█	▉	▊	▋	▌	▍	▎	▏
  // U+259x	▐	░	▒	▓	▔	▕	▖	▗	▘	▙	▚	▛	▜	▝	▞	▟
  const blockChars = [
    ' ', '▝', '▘', '▀',
    '▗', '▐', '▚', '▜',
    '▖', '▞', '▌', '▛',
    '▄', '▟', '▙', '█'
  ];

  if (!block || block.length !== 2 || block[0].length !== 2 || block[1].length !== 2) {
    console.error('bad block, should be a 2x2 array. eg. [ [0, 1], [1, 0] ]', block);
    return chalk.red('?');
  }

  // Binary map pos:  2 1
  //                  8 4
  let index = block[0][1];
  index += (block[0][0] * 2);
  index += (block[1][1] * 4);
  index += (block[1][0] * 8);

  return blockChars[index];
}

/**
 * 
 * @param {WritableStream} writeStream 
 * @param {{width:Number,height:Number}} sizeRequired 
 */
function isRoomToRender(writeStream, sizeRequired) {
  let [windowX, windowY] = writeStream.getWindowSize()
  const { width: needX, height: needY } = sizeRequired;

  return (windowX >= needX && windowY >= needY);
}

/**
 * 
 * @param {WritableStream} writeStream 
 * @param {{width:Number,height:Number}} required 
 * @param {Number = 10000} msToWait 
 */
async function waitForRoomToRender(writeStream, required, msToWait = 10000) {
  if (isRoomToRender(writeStream, required)) {
    return true;
  }
  
  let [windowX, windowY] = writeStream.getWindowSize()
  const t1 = Date.now() + msToWait;
  printError();

  let interval, timeout, resizeFn;
  return await new Promise((resolve) => {
    interval = setInterval(printError, 500);
    timeout = setTimeout(onTimeout(resolve), msToWait);
    writeStream.on('resize', resizeFn = onResize(resolve));
  })

  function onTimeout(resolve) {
    return () => {
      cleanUpEvents();
      console.error('Not enough room to render', `Need: ${required.width} x ${required.height}`, `Have: ${windowX} x ${windowY}`);
      resolve(false);
    };
  }

  function printError() {
    let secondsLeft = Math.round((t1 - Date.now()) / 100) / 10;

    let instructions = [];
    if (required.width > windowX) instructions.push('wider');
    if (required.height > windowY) instructions.push('taller');
    let resizeStr = chalk.red(instructions.join(' and '));

    console.error(chalk.yellow(`Make window ${resizeStr} in ${secondsLeft}s to render.  `));
    process.stdout.moveCursor(0, -1);
  }

  function onResize(resolve) {
    return () => {
      [windowX, windowY] = writeStream.getWindowSize();
      if (isRoomToRender(writeStream, required)) {
        cleanUpEvents();
        resolve(true);
      } else {
        printError();
      }
    };
  }

  function cleanUpEvents() {
    writeStream.removeListener('resize', resizeFn);
    clearInterval(interval);
    clearTimeout(timeout);
  }
}

/**
 * @typedef {object} Renderer
 * @prop {(Number, Number) =>} moveTo 
 * @prop {(String) =>} write 
 * @prop {(...args: any) =>} close 
 * @prop {({x:Number, y:Number}) =>} setOffset
 */

/**
 * @typedef {object} Panel
 * @prop {[Number, Number]} coords
 * @prop {Number} color
 */
class Panel {
  constructor(x, y, color) {
    this.coords = [x, y];
    this.color = color;
  }
}

/**
 * @typedef {[[Number, Number], [Number, Number]]} Block
 */

/**
 * @enum {Number}
 */
const YAXIS = {
  TOP_TO_BOTTOM: 1,
  BOTTOM_TO_TOP: -1
};

module.exports = { renderAllPanels, calculateMinMax, preparePlotArea, plotPanels, plotPanelAsBlock, isRoomToRender, waitForRoomToRender, YAXIS, Panel };
