const { renderAllPanels, calculateMinMax, preparePlotArea, plotPanels, plotPanelAsBlock, isRoomToRender, waitForRoomToRender, YAXIS, Panel }
= require('./render');
const chalk = require('chalk')

describe('Render module', () => {
  const blockChars = [
    ' ', '▝', '▘', '▀',
    '▗', '▐', '▚', '▜',
    '▖', '▞', '▌', '▛',
    '▄', '▟', '▙', '█'
  ];

  test('plotPanelAsBlock', () => {
    const blocks = new Map();
    let panel;
    const cursor = {
      write: jest.fn(),
      moveTo: jest.fn()
    }
    
    panel = new Panel(0, 0, 1);
    plotPanelAsBlock(cursor, panel, blocks);

    expect(cursor.write).toHaveBeenCalledTimes(1);
    expect(cursor.moveTo).toHaveBeenNthCalledWith(1, 0, 0);
    expect(cursor.write).toHaveBeenNthCalledWith(1, '▘', chalk.white);

    panel = new Panel(0, 1, 1);
    plotPanelAsBlock(cursor, panel, blocks);

    expect(cursor.write).toHaveBeenCalledTimes(2);
    expect(cursor.moveTo).toHaveBeenNthCalledWith(2, 0, 0);
    expect(cursor.write).toHaveBeenNthCalledWith(2, '▌', chalk.white);

    panel = new Panel(1, 0, 1);
    plotPanelAsBlock(cursor, panel, blocks);

    expect(cursor.write).toHaveBeenCalledTimes(3);
    expect(cursor.moveTo).toHaveBeenNthCalledWith(3, 0, 0);
    expect(cursor.write).toHaveBeenNthCalledWith(3, '▛', chalk.white);
  })

  test('plotPanelAsBlock offset { x: 1, y: 1 }', () => {
    const blocks = new Map();
    let panel;
    const cursor = {
      write: jest.fn(),
      moveTo: jest.fn()
    }
    const offset = { x: 1, y: 1 };
    
    panel = new Panel(0, 0, 1);
    plotPanelAsBlock(cursor, panel, blocks, offset);

    expect(cursor.write).toHaveBeenCalledTimes(1);
    expect(cursor.moveTo).toHaveBeenNthCalledWith(1, 0, 0);
    expect(cursor.write).toHaveBeenNthCalledWith(1, '▗', chalk.white);

    panel = new Panel(0, 1, 1);
    plotPanelAsBlock(cursor, panel, blocks, offset);

    expect(cursor.write).toHaveBeenCalledTimes(2);
    expect(cursor.moveTo).toHaveBeenNthCalledWith(2, 0, 1);
    expect(cursor.write).toHaveBeenNthCalledWith(2, '▝', chalk.white);

    panel = new Panel(1, 0, 1);
    plotPanelAsBlock(cursor, panel, blocks, offset);

    expect(cursor.write).toHaveBeenCalledTimes(3);
    expect(cursor.moveTo).toHaveBeenNthCalledWith(3, 1, 0);
    expect(cursor.write).toHaveBeenNthCalledWith(3, '▖', chalk.white);
  })

  test('plotPanelAsBlock offset { x: 2, y: 2 }', () => {
    const blocks = new Map();
    let panel;
    const cursor = {
      write: jest.fn(),
      moveTo: jest.fn()
    }
    const offset = { x: 2, y: 2 };
    
    panel = new Panel(0, 0, 1);
    plotPanelAsBlock(cursor, panel, blocks, offset);

    expect(cursor.write).toHaveBeenCalledTimes(1);
    expect(cursor.moveTo).toHaveBeenNthCalledWith(1, 1, 1);
    expect(cursor.write).toHaveBeenNthCalledWith(1, '▘', chalk.white);

    panel = new Panel(0, 1, 1);
    plotPanelAsBlock(cursor, panel, blocks, offset);

    expect(cursor.write).toHaveBeenCalledTimes(2);
    expect(cursor.moveTo).toHaveBeenNthCalledWith(2, 1, 1);
    expect(cursor.write).toHaveBeenNthCalledWith(2, '▌', chalk.white);

    panel = new Panel(1, 0, 1);
    plotPanelAsBlock(cursor, panel, blocks, offset);

    expect(cursor.write).toHaveBeenCalledTimes(3);
    expect(cursor.moveTo).toHaveBeenNthCalledWith(3, 1, 1);
    expect(cursor.write).toHaveBeenNthCalledWith(3, '▛', chalk.white);
  })
})