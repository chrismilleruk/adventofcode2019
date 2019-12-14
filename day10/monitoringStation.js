
async function* getCoords(linesAsync) {
  // The asteroids can be described with X,Y coordinates where X is the distance 
  // from the left edge and Y is the distance from the top edge (so the top-left 
  // corner is 0,0 and the position immediately to its right is 1,0).

  let y = 0;
  for await (const line of linesAsync) {

    let x = 0;
    for (const value of line) {
      if (['#', 'X'].indexOf(value) > -1) {
        yield [x, y];
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

    const angles = getAsteroidsByAngle(asteroids, candidate);

    // Number of unique angles = number of asteroids detected.
    candidate.detected = angles.size;
  }

  return asteroids;
}

function getAsteroidsByAngle(asteroids, candidate) {
  const angles = new Map();
  for (const target of [...asteroids.values()].filter(x => candidate.key !== x.key)) {
    const deltaX = target.coord[0] - candidate.coord[0];
    const deltaY = target.coord[1] - candidate.coord[1];
    let angleRad = Math.atan2(deltaX, deltaY);
    let angle = angleRad * (180 / Math.PI);
    let distance = Math.abs(deltaX) + Math.abs(deltaY);

    if (!angles.has(angle)) {
      angles.set(angle, []);
    }

    angles.get(angle).push({
      key: target.key,
      coord: target.coord,
      distance,
      angle
    });
  }
  return angles;
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

function* fireRotatingLaser(asteroids, station) {
  const asteroidsByAngle = getAsteroidsByAngle(asteroids, station);
  let directions = [...asteroidsByAngle.keys()].sort((a, b) => b - a);

  while (directions.length > 0) {
    let d = directions.shift();

    // get all asteroids on this trajectory, ordered by closest first.
    let asteroids = asteroidsByAngle.get(d).sort((a, b) => a.distance - b.distance);

    // shoot the closest asteroid.
    yield asteroids.shift();

    // if asteroids remain on this angle, pop it on the stack for the next round.
    if (asteroids.length > 0) {
      directions.push(d);
    }
  }
}

module.exports = { getCoords, detectAsteroids, findBestLocation, fireRotatingLaser };
