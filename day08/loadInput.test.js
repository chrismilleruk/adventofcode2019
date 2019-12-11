const {
  createStreamFromString,
  createStreamFromFile,
  layersToStats
} = require('./loadInput');

// Helper function to gather all tokens into an array.
async function collectTokens(testString, width, height) {
  let tokens = [];
  for await (let token of createStreamFromString(testString, width, height)) {
    tokens.push(token);
  }
  return tokens;
}

describe('create stream with valid tokens', () => {

  test('simple input', async () => {
    const input = `123456789012`;
    let layers = await collectTokens(input, 3, 2);

    expect(layers.length).toBe(2);
    expect(layers[0]).toBe('123456');
    expect(layers[1]).toBe('789012');
  });

  test('whitespace at start and end', async () => {
    const input = `
    123123
    `;
    let layers = await collectTokens(input, 3, 2);

    expect(layers.length).toBe(1);
  });

  test('whitespace before and after tokens', async () => {
    const input = `123123   
    123123
123123     `;
    let layers = await collectTokens(input, 3, 2);

    expect(layers.length).toBe(3);
  });
});

describe('get layer stats', () => {
  test('simple layers', async () => {
    const input = `123456789012`;
    let layers = [];
    for await (let layer of layersToStats(createStreamFromString(input, 3, 2))) {
      layers.push(layer);
    }

    expect(layers.length).toBe(2);
    expect(layers[0]).toMatchObject({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 })
    expect(layers[1]).toMatchObject({ 7: 1, 8: 1, 9: 1, 0: 1, 1: 1, 2: 1 })
  })
});
