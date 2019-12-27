

class MazeRunner {
  static async parse(linesAsync, validTiles = '.') {
    let tiles = [], x = 0, y = 0;
    for await (const line of linesAsync) {
      x = 0;
      for (const char of line) {
        if (validTiles.indexOf(char) > -1) {
          let tile = new Tile(x, y, char);
          if (char !== validTiles[0]) {
            tile.id = char;
          }
          tiles.push(tile);
        }
        x += 1;
      }
      y += 1;
    }
    return new MazeRunner(tiles, validTiles);
  }

  static linkNESW(tile) {
    return {
      N: String([tile.x, tile.y - 1]),
      E: String([tile.x + 1, tile.y]),
      S: String([tile.x, tile.y + 1]),
      W: String([tile.x - 1, tile.y]),
      _reverseLink: {
        N: 'S',
        E: 'W',
        S: 'N',
        W: 'E'
      }
    }
  }

  constructor(tiles, validTiles) {
    this._tiles = new Map();
    this._aliases = new Map();
    this._metadataCache = new Map();
    for (const tile of tiles) {
      this._tiles.set(tile.key, tile);
      if (tile.char !== validTiles[0]) {
        this._aliases.set(tile.char, tile);
      }
    }
  }

  linkTiles(generateLinkKeyMap = MazeRunner.linkNESW) {
    for (const tile of this._tiles.values()) {
      if (!(tile instanceof Tile)) continue;
      this.linkTile(tile, generateLinkKeyMap);
    }
  }

  addTile(x, y, char, generateLinkKeyMap = MazeRunner.linkNESW) {
    const tile = new Tile(x, y, char);
    this._tiles.set(tile.key, tile);
    this.linkTile(tile, generateLinkKeyMap);
    this._metadataCache.clear();
  }

  linkTile(tile, generateLinkKeyMap) {
    const keyMap = generateLinkKeyMap(tile);
    const reverseLink = keyMap._reverseLink;
    delete keyMap['_reverseLink'];

    for (let [linkName, tileKey] of Object.entries(keyMap)) {
      // Perf: If we already created this link, skip
      if (tile.links.has(linkName)) continue;

      // Get the linked tile from the tileKey
      const linkedTile = this.get(tileKey)
      if (!(linkedTile instanceof Tile)) continue;
      tile.linkTile(linkedTile, linkName);

      // Perf: Link back to this tile from the linked tile.
      if (!reverseLink || !reverseLink[linkName]) continue;
      linkedTile.linkTile(tile, reverseLink[linkName])
    }
  }

  getDistanceMeta(fromKey, maxSteps = 100) {
    if (this._metadataCache.has(fromKey)) {
      return this._metadataCache.get(fromKey);
    }

    const metadataMap = new Map();
    const junctionsData = new Map();

    let previousTile;
    let currentTile = this.get(fromKey);
    let nextTile;
    let distance = 0;

    while (maxSteps--) {
      // Get or create metadata for this tile.
      let currentMeta = metadataMap.get(currentTile.key)
      if (!currentMeta) {
        currentMeta = new TileMeta(currentTile, distance, metadataMap);
        metadataMap.set(currentTile.key, currentMeta);
      }

      if (currentMeta.links.names.size > 2) {
        // A junction has more than 2 exits so we'll need to revisit.
        junctionsData.set(currentMeta.key, currentMeta);
      }

      if (previousTile) {
        currentMeta.links.tileKeys.add(previousTile.key);
      }

      // Get unvisited paths from current tile. 
      let nextSteps = currentTile.linkKeys([...currentMeta.links.tileKeys]);

      // If there are no unvisited paths from this tile, jump to one that needs visits
      if (nextSteps.length === 0) {
        // Find a tile with paths we haven't yet visited.
        currentMeta = [...metadataMap.values()].find(m => {
          return m.links.names.size > m.links.tileKeys.size;
        })

        // If we didn't find one then we have visited everywhere.
        if (!currentMeta) break;

        // Jump to the new tile.
        currentTile = this.get(currentMeta.key);
        nextSteps = currentTile.linkKeys([...currentMeta.links.tileKeys]);
        distance = currentMeta.distance;

        if (nextSteps.length === 0) throw `Error: cannot navigate after jumping to '${currentMeta.key}'`
      }

      // Find next and mark it as visited.
      nextTile = currentTile.links.get(nextSteps[0])
      currentMeta.links.tileKeys.add(nextTile.key);

      // Step forward.
      previousTile = currentTile;
      currentTile = nextTile;
      distance += 1;
    }

    // Fix distances from evey junction.
    for (const junction of junctionsData.values()) {
      const adjacent = junction.adjacent;

      // 
      let tooLow = adjacent.filter(metadata => (junction.distance - metadata.distance) > 1);
      if (tooLow.length) {
        let lowest = tooLow.reduce((lowest, current) => lowest < current.distance ? lowest : current.distance, junction.distance);
        junction.distance = lowest + 1;
      }

      let tooHigh = adjacent.filter(metadata => (metadata.distance - junction.distance) > 1);
      if (tooHigh.length) {
        
        // From:     // To:
        // 012345678 // 012345678
        // j   f   9 // 1   5   9
        // ihgfedcba // 23456789a

        // Fan out from the junction to correct distances.
        for (let next of tooHigh) {
          let current = junction;
          
          while (next) {
            // Stop if the next tile is already lower.
            if (current.distance + 1 >= next.distance) break;
            // Stop if we meet a junction.
            if (junctionsData.has(next.key)) break;

            next.distance = current.distance + 1;

            let nextKey = [...next.links.tileKeys].find(key => key != current.key);

            current = next;
            next = metadataMap.get(nextKey);
          }
        }
      }
    }

    this._metadataCache.set(fromKey, metadataMap);

    return metadataMap;
  }

  shortestDistance(fromKey, toKey, maxSteps = 100) {
    const metadataMap = this.getDistanceMeta(fromKey, maxSteps);

    const to = this.get(toKey);
    const toMetadata = metadataMap.get(to.key);
    toMetadata;/*?*/
    if (!toMetadata) {
      metadataMap;
    }
    return toMetadata ? toMetadata.distance : -1;
  }

  shortestRoutes(fromKey, toKey, maxSteps = 100) {
    const metadataMap = this.getDistanceMeta(fromKey, maxSteps);

    const to = this.get(toKey);
    const toMetadata = metadataMap.get(to.key);
    if (!toMetadata) {
      return [];
    }

    let routes = [];
    let route = []
    let current = toMetadata;

    getRoutes(routes, route, current)
    
    return routes;

    function getRoutes(routes, route, current) {
  
      routes.push(route);
  
      while (current) {
        // Start at the end and step back to a tile that is n-1 each time.
        route.unshift(current.id);
        let options = current.adjacent.filter(tile => tile.distance < current.distance);
        if (options.length === 0) {
          break;
        }

        current = options[0];

        if (options.length === 2) {
          getRoutes(routes, route.slice(), options[1])
        }
        if (options.length > 2) {
          throw `options.length > 2 // ${options}`
        }
      }
    }
  }

  get(tileKey) {
    let tile;
    switch (typeof tileKey) {
      case 'function':
        tile = tileKey(this._tiles);
        break;
      case 'object': // e.g. [2, 4]
      case 'string':
        tileKey = String(tileKey)
        tile = this._aliases.get(tileKey) || this._tiles.get(tileKey);
        break;
      default:
        throw `Unknown tileKey type '${typeof tileKey}': ${tileKey}`;
    }

    return tile
  }

  get tiles() {
    return this._tiles.values();
  }
}

class Tile {
  constructor(x, y, char) {
    this.x = x;
    this.y = y;
    this.char = char;
    this.links = new Map();
  }

  get key() {
    return String([this.x, this.y]);
  }

  get id() {
    return this._id || this.key;
  }
  
  set id(id) {
    this._id = id;
  }

  linkTile(tile, linkKey) {
    linkKey = linkKey || tile.key;
    this.links.set(linkKey, tile);
  }

  *linksIterator(exceptTiles = []) {
    for (let [key, value] of this.links.entries()) {
      if (exceptTiles.indexOf(value.key) > -1) continue;
      yield [key, value];
    }
  }

  linkKeys(exceptTiles) {
    return [...this.linksIterator(exceptTiles)].map(kv => kv[0]);
  }
}

class TileMeta {
  constructor(tile, distance, map) { 
    this.id = tile.id;
    this.key = tile.key;
    this.distance = distance;
    this.links = {
      names: new Set(tile.linkKeys()),
      tileKeys: new Set()
    };
    this.tile = tile

    this._map = map;
  }
  
  get adjacent() {
    return [...this.links.tileKeys].map(key => this._map.get(key))
  }
}

module.exports = { MazeRunner }
