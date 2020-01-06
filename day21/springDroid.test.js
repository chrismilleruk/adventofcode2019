const { SpringDroid } = require('./springDroid');
const filename = __dirname + '/input.txt';

describe('Spring Droid', () => {
  const program1 = `
  NOT A J
  NOT B T
  AND T J
  NOT C T
  AND T J
  AND D J
  `;
  const program2 = `
  NOT D J
  `;
  test('program 2 jumps into a hole.', async () => {
    const springDroid = new SpringDroid(filename);
    await springDroid.loadSpringScript(program2);
    await springDroid.walk();

    let result = springDroid.result();
    let lastMoments = springDroid.lastMoments();
    let log = springDroid.log();

    expect(result).toBe(73);
    expect(lastMoments).toBe(`Input instructions:

Invalid operation; expected something like AND, OR, or NOT
`);
    expect(log).toBe(`
>Input instructions:

N
>
Invalid operation; expected something like AND, OR, or NOT
`);
  })
})