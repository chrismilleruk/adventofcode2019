

class MazeRunner {
  /**
   * Parses String Lines to list(s) of tiles;
   * @param {AsyncGenerator<String>} linesAsync An interator of lines<String> to parse;
   * @param  {...String[]} listOfValidTileChars 
   * 
   * @returns {{'validChars': Array<Tile>, 'otherChars': Array<Tile>}}
   */
  static async parseTiles(linesAsync, ...listOfValidTileChars) {
    let x = 0, y = 0;
    let tiles = Object.fromEntries(listOfValidTileChars.map((chars) => [chars, []]));
    for await (const line of linesAsync) {
      x = 0;
      for (const char of line) {
        for (const tileChars of listOfValidTileChars) {
          if (tileChars.indexOf(char) > -1) {
            let tile = new SmartTile(x, y, char);
            tiles[tileChars].push(tile);
          }
        }
        x += 1;
      }
      y += 1;
    }
    return tiles;
  }

  /**
   * 
   * @param {AsyncGenerator<String>} linesAsync A list of lines<string> to parse.
   * @param {String} validTileChars Defaults to '.' so any `.`s are treated as tiles.
   * @param {String?} specialTileChars 
   */
  static async parse(linesAsync, validTileChars = '.', specialTileChars = '') {
    let tiles = await MazeRunner.parseTiles(linesAsync, validTileChars, specialTileChars);
    const mazeRunner = new MazeRunner(tiles[validTileChars], validTileChars);
    mazeRunner.specialTiles = tiles[specialTileChars];
    return mazeRunner;
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
    this._metadataState = '';
    for (const tile of tiles) {
      this._tiles.set(tile.key, tile);
      if (tile.char !== validTiles[0]) {
        tile.id = tile.char;
        this._aliases.set(tile.id, tile);
      }
    }
    this.maxSteps = this._tiles.size * 10;
  }

  linkTiles(generateLinkKeyMap = MazeRunner.linkNESW) {
    this._linkKeyMapFn = generateLinkKeyMap;
    for (const tile of this._tiles.values()) {
      if (!(tile instanceof Tile)) continue;
      this._linkTile(tile, generateLinkKeyMap);
    }
  }

  addTileAt(x, y, id) {
    const tile = new SmartTile(x, y, id, id);
    this.addTile(tile);
  }

  /**
   * Adds a new tile to the maze, e.g. an unlocked door.
   * @param {Tile} tile The tile to add.
   */
  addTile(tile) {
    if (!this._linkKeyMapFn) throw 'Run mazeRunner.linkTiles() first.'
    this._tiles.set(tile.key, tile);
    this._linkTile(tile, this._linkKeyMapFn);

    // Maze has changed shape so clear cache
    this.cacheClear();
  }

  /**
   * Links two existing tiles together
   * @param {Tile|String} tile1 The first tile | tileKey
   * @param {Tile|String} tile2 The 2nd tile | tileKey
   * @param {String} linkName The link name (e.g. East)
   * @param {String?} linkName2 The opposite link name (e.g. West), defaults to `linkName`
   */
  addLink(tile1, tile2, linkName, linkName2 = linkName) {
    if (!(tile1 instanceof Tile)) tile1 = this.get(tile1);
    if (!(tile2 instanceof Tile)) tile2 = this.get(tile2);

    tile1.linkTo(tile2, linkName);
    tile2.linkTo(tile1, linkName2);

    // Maze has changed shape so clear cache
    this.cacheClear();
  }

  cacheClear() {
    this._metadataCache.clear();
  }

  /**
   * 
   * @param {Tile} tile 
   * @param {(Tile) => Object} generateLinkKeyMap 
   */
  _linkTile(tile, generateLinkKeyMap) {
    const keyMap = generateLinkKeyMap(tile);
    const reverseLink = keyMap._reverseLink;
    delete keyMap['_reverseLink'];

    if (tile.id !== tile.key && !this._aliases.has(tile.id)) {
      this._aliases.set(tile.id, tile);
    }

    for (let [linkName, tileKeyFn] of Object.entries(keyMap)) {
      // Perf: If we already created this link, skip
      if (tile.links.has(linkName)) continue;

      if (typeof tileKeyFn !== 'function') {
        let tileKey = tileKeyFn;
        tileKeyFn = () => {
          return { 
            linkedTile: this.get(tileKey),
            testStateFn: () => true,
            newStateFn: (state) => state
           };
        };
      }
      const { linkedTile, testStateFn, newStateFn } = tileKeyFn(this);

      // Get the linked tile from the tileKey
      // const linkedTile = this.get(tileKey)
      if (!(linkedTile instanceof Tile)) continue;
      tile.linkTo(linkedTile, linkName, testStateFn, newStateFn);

      // Perf: Link back to this tile from the linked tile.
      if (!reverseLink || !reverseLink[linkName]) continue;
      linkedTile.linkTo(tile, reverseLink[linkName], testStateFn, newStateFn)

      if (typeof tileKeyFn === 'function') {
        [tile.id, linkName, linkedTile.id, testStateFn(''), newStateFn('')];/*?*/
      }

    }
  }

  getDistanceMeta(fromKey, mapState = '') {
    let cache = this._metadataCache.get(fromKey);
    if (!cache) {
      cache = new Map();
      this._metadataCache.set(fromKey, cache);
    }
    if (cache && cache.has(mapState)) {
      return cache.get(mapState);
    }

    const metadataMap = new Map();

    let currentNodes = new Map();
    let nextNodes = new Map();
    let distance = 0;

    currentNodes.set(fromKey, createNode(this.get(fromKey), distance, mapState));

    while (currentNodes.size > 0) {
      distance += 1;

      for (const [nodeKey, node] of currentNodes) {

        // Get adjacent nodes.
        const adjacentNodes = getAdjacentNodes(node.tile, distance, node.mapState);

        // Add unvisited nodes to nextTiles
        for (const nextNode of adjacentNodes.filter(node => node.distance === distance)) {
          // if (true) {
          //   [node.id, nextNode.id, node.mapState, nextNode.mapState];/*?*/
          // }
  
          nextNodes.set(nextNode.key, nextNode);
          nextNode.previous.add(node);
        }
      }

      currentNodes = nextNodes
      nextNodes = new Map();
    }

    cache.set(mapState, metadataMap);

    return metadataMap;

    function createNode(tile, defaultDistance, mapState) {
      // Get or create metadata for this tile.
      let tileData = metadataMap.get(tile.key)
      if (!tileData) {
        tileData = new Map();
        metadataMap.set(tile.key, tileData);
      }
      let metadata = tileData.get(mapState);
      if (!metadata) {
        metadata = new TileMeta(tile, defaultDistance, mapState);
        tileData.set(mapState, metadata);
      }
      return metadata;
    }

    function getAdjacentNodes(rootTile, defaultDistance, currentState) {
      let result = [];
      for (const { tile, state } of rootTile.smartLinks(currentState)) {
        // if (state) [tile, state];/*?*/
        const node = createNode(tile, defaultDistance, state);
        // if (rootTile.key === '7,1') [ rootTile, tile, state, node ];/*?*/
        result.push(node)
      }
      // result;/*?*/
      return result;
    }
  }

  shortestDistance(fromKey, toKey, fromMapState = '', toMapState = fromMapState) {
    const metadataMap = this.getDistanceMeta(fromKey, fromMapState);

    const to = this.get(toKey);
    // TODO: get metadata for 'to' tile in *any* state.
    const tileData = metadataMap.get(to.key);
    if (!tileData) return -1;

    const toMetadata = tileData.get(toMapState);
    return toMetadata ? toMetadata.distance : -1;
  }

  shortestRoutes(fromKey, toKey, fromMapState = '', toMapState = fromMapState) {
    const metadataMap = this.getDistanceMeta(fromKey, fromMapState);

    const to = this.get(toKey);
    const tileData = metadataMap.get(to.key);
    if (!tileData) return [];

    const toMetadata = tileData.get(toMapState);
    if (!toMetadata) {
      return [];
    }

    let routes = [];
    let route = []
    let current = toMetadata;

    getRoutesRecursive(routes, route, current)

    return routes;

    function getRoutesRecursive(routes, route, current) {

      routes.push(route);

      while (current) {
        // Start at the end and step back to a tile that is n-1 each time.
        route.unshift(current.id);

        // let options = current.adjacent.filter(tile => tile.distance < current.distance);
        let options = [...current.previous];
        if (!options || options.length === 0) {
          break;
        }

        current = options[0];

        if (options.length === 2) {
          getRoutesRecursive(routes, route.slice(), options[1])
        }
        if (options.length > 2) {
          throw `options.length > 2 // ${options}`
        }
      }
    }
  }

  /**
   * 
   * @param {String} tileKey 
   * 
   * @returns {Tile} a Tile.
   */
  get(tileKey) {
    let tile;
    switch (typeof tileKey) {
      case 'function':
        tile = tileKey(this);
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
  constructor(x, y, char, id) {
    this.x = x;
    this.y = y;
    this.char = char;
    this.links = new Map();
    if (id) {
      this._id = id;
    }
  }

  clone() {
    return new Tile(this.x, this.y, this.char, this._id);
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

  linkTo(tile, linkName) {
    linkName = linkName || tile.key;
    this.links.set(linkName, tile);
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

class SmartTile extends Tile {
  constructor(x, y, char, id) {
    super(x, y, char, id);
    this._smartLinks = new Map();
  }

  clone() {
    return new SmartTile(this.x, this.y, this.char, this._id);
  }

  *smartLinks(state) {
    // if (state) state;/*?*/
    // Include all the regular links
    for (const tile of this.links.values()) {
      yield { tile, state };
    }
    // Include all smartLinks if condition=true && mutate state.
    for (const { tile, testStateFn, newStateFn } of this._smartLinks.values()) {
      const newState = newStateFn(state);
      // if (tile.key === '7,1') 
      //   [ this.id, tile.id, state, newStateFn(state), testStateFn(state)];/*?*/
      // if (newState !== state) newState;/*?*/
      if (testStateFn(state)) {
        yield { tile, state: newState };
      }
    }
  }

  linkTo(tile, linkName, testStateFn = null, newStateFn = null) {
    linkName = linkName || tile.key;
    if (!testStateFn && !newStateFn) {
      this.links.set(linkName, tile);
      return;
    }
    this._smartLinks.set(linkName, { tile, testStateFn, newStateFn });

    // if (this.id == '6,1') {
    //   [this.id, linkName, tile.id, testStateFn(''), newStateFn('')];/*?*/
    // }

  }
}


class TileMeta {
  constructor(tile, distance, state) {
    this.id = tile.id;
    this.key = tile.key;
    this.distance = distance;
    this.mapState = state;
    // if (state) state;/*?*/
    this.previous = new Set();
    this.tile = tile
  }
}

module.exports = { MazeRunner }
