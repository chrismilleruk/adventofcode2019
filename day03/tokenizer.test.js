const { createStreamFromString, createStreamFromFile } = require('./tokenizer');

describe('tokenizer', () => {
  async function collectTokens(testString) {
    let tokens = [];
    for await (let token of createStreamFromString(testString)) {
      tokens.push(token);
    }
    return tokens;
  }

  it('should return EOL at EOF', async () => {
    let tokens = await collectTokens('');
    expect(tokens).toEqual(['EOL']);
  });
  it('should return EOL for every line and EOF', async () => {
    let tokens = await collectTokens(`


`);
    expect(tokens).toEqual(['EOL', 'EOL', 'EOL', 'EOL']);
  });
  it('should ignore whitespace', async () => {
    let tokens = await collectTokens(' ');
    expect(tokens).toEqual(['EOL']);
  });
  it('should ignore whitespace on multiple lines', async () => {
    let tokens = await collectTokens(`   
   
          `);
    expect(tokens).toEqual(['EOL', 'EOL', 'EOL']);
  });
  it('should tokenize a simple example', async () => {
    let tokens = await collectTokens(`R8,U5,L5,D3,
        U7,R6,D4,L4`);
    expect(tokens).toEqual(
      ['R8', 'U5', 'L5', 'D3', 'EOL', 'U7', 'R6', 'D4', 'L4', 'EOL']
    );
  });
});
