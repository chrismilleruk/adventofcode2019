const {
  createStreamFromString,
  createStreamFromFile
} = require('./loadInput');

// Helper function to gather all tokens into an array.
async function collectTokens(testString) {
  let tokens = [];
  for await (let token of createStreamFromString(testString)) {
    tokens.push(token);
  }
  return tokens;
}

describe('create stream with valid tokens', () => {

  test('simple input', async () => {
    const input = `123123
123123    
123123`;
    let tokens = await collectTokens(input);

    expect(tokens.length).toBe(3);
  });

  test('whitespace at start and end', async () => {
    const input = `
    123123
    `;
    let tokens = await collectTokens(input);

    expect(tokens.length).toBe(1);
  });

  test('whitespace before and after tokens', async () => {
    const input = `123123   
    123123
123123     `;
    let tokens = await collectTokens(input);

    expect(tokens.length).toBe(3);
  });

  test('capture all tokens', async () => {
    const input = `
COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L`;
    let tokens = await collectTokens(input);

    expect(tokens.length).toBe(11);
  })
});
