
async function* getCoords(linesAsync) {
  // The asteroids can be described with X,Y coordinates where X is the distance 
  // from the left edge and Y is the distance from the top edge (so the top-left 
  // corner is 0,0 and the position immediately to its right is 1,0).

  let y = 0;
  for await (const line of linesAsync) {

    let x = 0;
    for (const value of line) {
      if (value === '#') {
        yield [ x, y ];
      }

      x += 1;
    }

    y += 1;
  }
}

async function detectAsteroids(linesAsync) {
  const asteroids = new Map();

  for await (const coord of getCoords(linesAsync)) {
    let key = String(coord);
    asteroids.set(key, { key, coord });
  }

  for (const candidate of asteroids.values()) {

    const angles = new Set();
    for (const target of [...asteroids.values()].filter(x => candidate.key !== x.key)) {
      // soh cah toa
      let angle = Math.atan2(
        target.coord[0] - candidate.coord[0],
        target.coord[1] - candidate.coord[1]
        );
      let angleDeg = angle * (180/Math.PI);

      angles.add(angleDeg);
    }

    // Number of unique angles = number of asteroids detected.
    candidate.detected = angles.size;
  }

  return asteroids;
}

function findBestLocation(asteroids) {
  return [...asteroids.values()].reduce((prev, curr) => {
    if (curr.detected > prev.detected) {
      return curr;
    } else {
      return prev;
    }
  }, { detected: 0 })
}


module.exports = { getCoords, detectAsteroids, findBestLocation};
