const { createStreamFromFile, createStreamFromString } = require('./loadInput');
const { flattenLayers } = require('./render');

describe('render module', () => {

  // For example, given an image 2 pixels wide and 2 pixels tall, the image data 0222112222120000 corresponds to the following image layers:
  // Layer 1: 02
  //          22
  // Layer 2: 11
  //          22
  // Layer 3: 22
  //          12
  // Layer 4: 00
  //          00
  test('For example, given an image 2 pixels wide and 2 pixels tall, the image data 0222112222120000', async () => {
    const input = `0222112222120000`;
    const w = 2, h = 2;
    
    let rendering = await flattenLayers(createStreamFromString(input, w, h));

    expect(rendering.join('')).toBe('0110');
  });

  test('What message is produced after decoding your image?', async () => {
    const filename = __dirname + '/input.txt';
    
    let rendering = await flattenLayers(createStreamFromFile(filename));

    expect(rendering.length).toBe(25 * 6);
  });
  
});
