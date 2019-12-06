const { createStreamFromString, createStreamFromFile } = require('./tokenizer');

const filename = __dirname + '/input.txt';

if (require.main === module) {
  (async () => {
    let inputStream = createStreamFromFile(filename);
    let result = await findClosestIntersection(inputStream);
    console.log('What is the Manhattan distance from the central port to the closest intersection?', result);
    inputStream = createStreamFromFile(filename);
    result = await findShortestIntersection(inputStream);
    console.log('What is the fewest combined steps the wires must take to reach an intersection?', result);
  })();
}

function* generatePositions(position, instruction) {
  let deltaX = 0, deltaY = 0;
  const dir = instruction[0];
  let dist = instruction.slice(1);
  dist = parseInt(dist, 10);

  switch (dir) {
    case 'U':
      deltaX += 1;
      break;
    case 'D':
      deltaX -= 1;
      break;
    case 'R':
      deltaY += 1;
      break;
    case 'L':
      deltaY -= 1;
      break;
  }

  while (dist--) {
    position.x += deltaX;
    position.y += deltaY;

    // return a copy
    let { x, y } = position;
    yield { x, y };
  }
}

async function findIntersections(inputStream) {
  let eolCount = 0;
  let position = { x: 0, y: 0 };
  let wire1 = new Map();
  let intersections = new Set();

  let w1dist = 1;
  let w2dist = 1;

  for await (let token of inputStream) {
    if (token === 'EOL') {
      eolCount++;
      position = { x: 0, y: 0 };
      continue;
    }
  

    if (eolCount === 0) {
      // Store wire positions for 1st wire.
      for (let pos of generatePositions(position, token)) {
        const key = getKey(pos);
        pos.w1 = w1dist++;

        wire1.set(key, pos);
      }
    } else {
      // Check wire positions for 2nd wire.
      let distance = 1;
      for (let pos of generatePositions(position, token)) {
        const key = getKey(pos);
        pos.w2 = w2dist++;

        if (wire1.has(key)) {
          let w1pos = wire1.get(key);
          pos.w1 = w1pos.w1;

          intersections.add(pos);
        }
      }
    }
  }

  return Array.from(intersections);

  function getKey(pos) {
    return `${pos.x},${pos.y}`;
  }
}

async function findClosestIntersection(inputStream) {
  let intersections = await findIntersections(inputStream);
  let distances = intersections.map(p => Math.abs(p.x) + Math.abs(p.y))
  let closest = distances.reduce((p, c) => Math.min(p, c));

  return closest;
}

async function findShortestIntersection(inputStream) {
  let intersections = await findIntersections(inputStream);
  let distances = intersections.map(i => i.w1 + i.w2)
  let shortest = distances.reduce((p, c) => Math.min(p, c));

  return shortest;
}

module.exports = {
  findClosestIntersection,
  findShortestIntersection,
  findIntersections,
  generatePositions,
  createStreamFromString,
  createStreamFromFile
};
