

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
  }

  getDistanceMeta(fromKey, maxSteps = 100) {
    const metadataMap = new Map();
    const junctionsData = new Map();

    let previous;
    let current = this.get(fromKey);
    let next;
    let distance = 0;

    while (maxSteps--) {
      // Get or create metadata for this tile.
      let currentMeta = metadataMap.get(current.key)
      if (!currentMeta) {
        currentMeta = { 
          id: current.id,
          key: current.key,
          distance,
          links: {
            keys: new Set(current.linkKeys()),
            visited: new Set()
          },
          tile: current
        };
        metadataMap.set(current.key, currentMeta);
      }

      if (currentMeta.links.keys.size > 2) {
        // A junction has more than 2 exits so we'll need to revisit.
        junctionsData.set(currentMeta.key, currentMeta);
      }

      if (previous) {
        currentMeta.links.visited.add(previous.key);
      }

      // Get unvisited paths from current tile. 
      let nextSteps = current.linkKeys([...currentMeta.links.visited]);

      // If there are no unvisited paths from this tile, jump to one that needs visits
      if (nextSteps.length === 0) {
        // Find a tile with paths we haven't yet visited.
        currentMeta = [...metadataMap.values()].find(m => {
          return m.links.keys.size > m.links.visited.size;
        })

        // If we didn't find one then we have visited everywhere.
        if (!currentMeta) break;

        // Jump to the new tile.
        current = this.get(currentMeta.key);
        nextSteps = current.linkKeys([...currentMeta.links.visited]);
        distance = currentMeta.distance;

        if (nextSteps.length === 0) throw `Error: cannot navigate after jumping to '${currentMeta.key}'`
      }

      // Find next and mark it as visited.
      next = current.links.get(nextSteps[0])
      currentMeta.links.visited.add(next.key);

      // Step forward.
      previous = current;
      current = next;
      distance += 1;
    }

    // Fix distances from evey junction.
    for (const junction of junctionsData.values()) {
      const adjacent = [...junction.links.visited].map(key => metadataMap.get(key));

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

            let nextKey = [...next.links.visited].find(key => key != current.key);

            current = next;
            next = metadataMap.get(nextKey);
          }
        }
      }
    }

    return metadataMap;
  }

  shortestDistance(fromKey, toKey, maxSteps = 100) {
    if (!this._metadataCache.has(fromKey)) {
      this._metadataCache.set(fromKey, this.getDistanceMeta(fromKey, maxSteps));
    }

    const metadataMap = this._metadataCache.get(fromKey);

    const to = this.get(toKey);
    const toMetadata = metadataMap.get(to.key);
    toMetadata;/*?*/
    if (!toMetadata) {
      metadataMap;
    }
    return toMetadata ? toMetadata.distance : -1;
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

module.exports = { MazeRunner }
