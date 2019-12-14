
function renderPanels(writeStream, panels) {
  // Get extents
  let xMin = 0, xMax = 0, yMin = 0, yMax = 0;
  for (panel of panels.values()) {
    xMin = Math.min(xMin, panel.coord[0]);
    xMax = Math.max(xMax, panel.coord[0]);
    yMin = Math.min(yMin, panel.coord[1]);
    yMax = Math.max(yMax, panel.coord[1]);
  }

  let width = xMax - xMin;
  let height = yMax - yMin;
  if (writeStream.columns < (width / 2) || writeStream.rows < (height / 2)) {
    console.log('Not enough room to render', 
      `Need: ${width} x ${height}`, 
      `Have: ${writeStream.columns} x ${writeStream.rows}`);
    console.log(width, height, xMin, xMax, yMin, yMax);
  }

  console.log('Panel area', width, 'x', height);

  let plotWidth = Math.ceil((width+1) / 2);
  let plotHeight = Math.ceil((height+1) / 2);
  const cursor = createPlotArea(writeStream, plotWidth, plotHeight);

  const blocks = new Map();
  for (panel of panels.values()) {
    plotPanelRelative(panel, cursor);
  }

  cursor.moveTo(0, plotHeight);
  console.log('')
  return;

  function createPlotArea(writeStream, width, height) {
    const boxLines = ['┃', '━', '┏', '┓', '┗', '┛'];
    console.log('┏' + ''.padEnd(width, '━') + '┓');
    for (let i = height; i--; ) {
      console.log('┃' + ''.padEnd(width, ' ') + '┃');
    }
    console.log('┗' + ''.padEnd(width, '━') + '┛');
    writeStream.moveCursor(1, -(height+1));

    let cursor = { 
      x: 0, 
      y: 0,
      moveTo: (x, y) => {
        // writeStream.cursorTo(x, y);
        let dx = x - cursor.x;
        let dy = y - cursor.y;
        writeStream.moveCursor(dx, dy);
        cursor.x = x;
        cursor.y = y;
      },
      write: (chars) => {
        writeStream.write(chars);
        cursor.x += chars.length;
      }
    };
    
    return cursor;
  }

  function plotPanelRelative(panel, cursor) {
    const plotCoordX = Math.floor((panel.coord[0] - xMin) / 2);
    const plotCoordY = Math.floor((panel.coord[1] - yMin) / 2);
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

    block[blockCoordY][blockCoordX] = panel.color;

    cursor.moveTo(plotCoordX, plotCoordY);
    // writeStream.moveCursor(plotCoordX, plotCoordY);
    cursor.write(getBlockChar(block));
    // writeStream.moveCursor(-plotCoordX, -plotCoordY);

    // cursor.x = blockCoordX;
    // cursor.y = blockCoordX;
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

module.exports = { renderPanels };
