
function renderAllPanels(writeStream, panels) {
  // Get extents
  let { plotWidth, plotHeight, offsetX, offsetY } = calculatePlotExtents(panels, writeStream);

  const cursor = preparePlotArea(writeStream, plotWidth, plotHeight);
  
  plotPanels(offsetX, offsetY, panels, cursor);

  cursor.close('Extents', plotWidth, plotHeight, offsetX, offsetY);
  return;

}

function calculatePlotExtents(panels, writeStream) {
  let offsetX = 0, xMax = 0, offsetY = 0, yMax = 0;
  for (panel of panels.values()) {
    offsetX = Math.min(offsetX, panel.coord[0]);
    xMax = Math.max(xMax, panel.coord[0]);
    offsetY = Math.min(offsetY, panel.coord[1]);
    yMax = Math.max(yMax, panel.coord[1]);
  }
  let width = xMax - offsetX;
  let height = yMax - offsetY;
  if (writeStream.columns < (width / 2) || writeStream.rows < (height / 2)) {
    console.log('Not enough room to render', `Need: ${width} x ${height}`, `Have: ${writeStream.columns} x ${writeStream.rows}`);
    console.log(width, height, offsetX, xMax, offsetY, yMax);
  }
  let plotWidth = Math.ceil((width + 1) / 2);
  let plotHeight = Math.ceil((height + 1) / 2);
  return { plotWidth, plotHeight, offsetX, offsetY };
}

function preparePlotArea(writeStream, width, height) {
  const boxLines = ['┃', '━', '┏', '┓', '┗', '┛'];
  console.log('┏' + ''.padEnd(width, '━') + '┓');
  for (let i = height; i--;) {
    console.log('┃' + ''.padEnd(width, ' ') + '┃');
  }
  console.log('┗' + ''.padEnd(width, '━') + '┛');
  // writeStream.moveCursor(1, -(height + 1));
  writeStream.moveCursor(1, -2);

  let cursor = {
    x: 0,
    y: 0,
    moveTo: (x, y) => {
      let dx = x - cursor.x;
      let dy = y - cursor.y;
      writeStream.moveCursor(dx, -dy);
      cursor.x = x;
      cursor.y = y;
    },
    write: (chars) => {
      writeStream.write(chars);
      cursor.x += chars.length;
    },
    close: (...args) => {
      // cursor.moveTo(0, height);
      cursor.moveTo(0, -1);
      console.log.apply(console, args);
    }
  };

  return cursor;
}

function plotPanels(xMin, yMin, panels, cursor) {
  const blocks = new Map();
  const offset = {
    x: xMin * -1,
    y: yMin * -1
  };
  for (panel of panels.values()) {
    plotPanelRelative(panel, cursor, offset);
  }


  function plotPanelRelative(panel, cursor, offset) {
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
    block[blockCoordY][blockCoordX] = panel.color;

    // Re-render this block.
    cursor.moveTo(plotCoordX, plotCoordY);
    cursor.write(getBlockChar(block));
  }

}


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

  // 
  if (!block || block.length !== 2 || block[0].length !== 2 || block[1].length !== 2) {
    console.log('bad block', block);
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

module.exports = { renderAllPanels, calculatePlotExtents, preparePlotArea, plotPanels };
