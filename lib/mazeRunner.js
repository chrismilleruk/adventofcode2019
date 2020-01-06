

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

  /**
   * Returns a `LinkKeyMap` from the given tile.
   * @param {Tile} tile A tile to provide links from.
   * @returns {LinkKeyMap}
   */
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

  /**
   * Constructs a new `MazeRunner`. `MazeRunner.parse()` is recommended.
   * @param {Iterable<Tile>} tiles A list of tiles.
   * @param {string} validTiles Chars that represent valid tiles. Anything other than validTiles[0] will be treated as an ID.
   */
  constructor(tiles, validTiles) {
    this._tiles = new Map();
    this._aliases = new Map();
    this._metadataCache = new Map();
    for (const tile of tiles) {
      this._tiles.set(tile.key, tile);
      if (tile.char !== validTiles[0]) {
        tile.id = tile.char;
        this._aliases.set(tile.id, tile);
      }
    }
    this.maxSteps = this._tiles.size * 10;
  }

  /**
   * Links all the tiles together using the LinkKeyMap (tells us where to look for N.E.S.W. from a given tile).
   * @param {(Tile) => LinkKeyMap} generateLinkKeyMap Generates a `LinkKeyMap` object.
   */
  linkTiles(generateLinkKeyMap = MazeRunner.linkNESW) {
    this._linkKeyMapFn = generateLinkKeyMap;
    for (const tile of this._tiles.values()) {
      if (!(tile instanceof Tile)) continue;
      this._linkTile(tile, generateLinkKeyMap);
    }
  }

  /**
   * Adds a new tile at the position.
   * @param {number} x X position
   * @param {number} y Y position
   * @param {string} id ID of the tile.
   */
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
   * @param {Tile|String} tileFrom The first tile | tileKey
   * @param {Tile|String} tileTo The 2nd tile | tileKey
   * @param {String} linkName The link name (e.g. East)
   * @param {String?} revLinkName The opposite link name (e.g. West), defaults to `linkName`
   */
  addLink(tileFrom, tileTo, linkName, revLinkName = linkName) {
    if (!(tileFrom instanceof Tile)) tileFrom = this.get(tileFrom);
    if (!(tileTo instanceof Tile)) tileTo = this.get(tileTo);

    tileFrom.linkTo(tileTo, linkName);
    tileTo.linkTo(tileFrom, revLinkName);

    // Maze has changed shape so clear cache
    this.cacheClear();
  }

  /**
   * Clears the internal cache.
   */
  cacheClear() {
    this._metadataCache.clear();
  }

  /**
   * 
   * @param {Tile} tile 
   * @param {(Tile) => LinkKeyMap} generateLinkKeyMap 
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
            fns: null
           };
        };
      }
      const { linkedTile, fns } = tileKeyFn(this);

      // Get the linked tile from the tileKey
      // const linkedTile = this.get(tileKey)
      if (!(linkedTile instanceof Tile)) continue;
      tile.linkTo(linkedTile, linkName, fns);

      // Perf: Link back to this tile from the linked tile.
      if (!reverseLink || !reverseLink[linkName]) continue;
      linkedTile.linkTo(tile, reverseLink[linkName], fns)
    }
  }

  /**
   * Uses a Djikstra algorithm to find the shortest distance to every navigable tile.
   * @param {string} fromKey x,y coordinate of the starting position.
   * @param {string} mapState map state of the starting position.
   * @returns {Map<string, Map<string, TileMeta>>} A double `Map` of `TileMeta` objects with key = [position, mapState]
   */
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
          nextNodes.set(nextNode.keyState, nextNode);
          nextNode.previous.add(node);
        }
      }

      currentNodes = nextNodes
      nextNodes = new Map();

      if (distance > this.maxSteps) {
        break;
        // throw 'Infinite loop detected. Max distance reached.'
      }
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
        const node = createNode(tile, defaultDistance, state);
        result.push(node)
      }
      return result;
    }
  }

  /**
   * Find the shortest distance from one tile to another.
   * @param {string} fromKey From position 'x,y'
   * @param {string} toKey To position 'x,y'
   * @param {string?} fromMapState From map state
   * @param {string?} toMapState To map state ('*' = any)
   * @returns {number}
   */
  shortestDistance(fromKey, toKey, fromMapState = '', toMapState = fromMapState) {
    const metadataMap = this.getDistanceMeta(fromKey, fromMapState);

    const to = this.get(toKey);
    // TODO: get metadata for 'to' tile in *any* state.
    const tileData = metadataMap.get(to.key);
    if (!tileData) return -1;

    if (toMapState === '*') {
      let bestDistance = Infinity;
      for (const toMetadata of tileData.values()) {
        bestDistance = Math.min(bestDistance, toMetadata.distance);
      }
      return bestDistance;
    }
    
    const toMetadata = tileData.get(toMapState);
    return toMetadata ? toMetadata.distance : -1;
  }

  /**
   * List the shortest routes from one tile to another.
   * @param {string} fromKey From position 'x,y'
   * @param {string} toKey To position 'x,y'
   * @param {string?} fromMapState From map state
   * @param {string?} toMapState To map state ('*' = any)
   * @returns {Array<Array<string>>} Array of Arrays containing a list of tile keys / ids on the route.
   */
  shortestRoutes(fromKey, toKey, fromMapState = '', toMapState = fromMapState) {
    const metadataMap = this.getDistanceMeta(fromKey, fromMapState);

    const to = this.get(toKey);
    const tileData = metadataMap.get(to.key);
    if (!tileData) return [];

    if (toMapState === '*') {
      let bestDistance = Infinity;
      for (const toMetadata of tileData.values()) {
        bestDistance = Math.min(bestDistance, toMetadata.distance);
      }
      
      let routes = [];
      let best = [...tileData.values()].filter(d => d.distance === bestDistance);
  
      for (const current of best) {
        getRoutesRecursive(routes, [], current)
      }

      return routes;
    }
    
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

        current = options.shift();

        while (options.length) {
          getRoutesRecursive(routes, route.slice(), options.shift())
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

/**
 * @class {Tile}
 */
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

  /**
   * @returns {Tile} An identical `Tile`.
   */
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

/**
 * @class {SmartTile} A `Tile` with conditional links.
 * @extends {Tile}
 */
class SmartTile extends Tile {
  constructor(x, y, char, id) {
    super(x, y, char, id);
    this._smartLinks = new Map();
  }

  /**
   * @returns {SmartTile} An identical `SmartTile`.
   */
  clone() {
    return new SmartTile(this.x, this.y, this.char, this._id);
  }

  /**
   * Iterates over the links based on the current map state.
   * 
   * @param {string} state The current map state.
   * @returns {Iterable<{tile:SmartTile, state:string}>} Iterates over each tile and an updated map state.
   */
  *smartLinks(state) {
    // Include all the regular links (if any)
    for (const tile of this.links.values()) {
      yield { tile, state };
    }

    // Include all smartLinks if condition=true && mutate state.
    for (const { tile, fns } of this._smartLinks.values()) {
      if (fns.canVisit(state)) {
        const newState = fns.onVisit(state);
        yield { tile, state: newState };
      }
    }
  }

  /**
   * Links this `SmartTile` to another `SmartTile` with `fns` to control behaviour.
   * @param {SmartTile} tile The tile to link to.
   * @param {String} linkName The name of the link (i.e. East)
   * @param { { canVisit:(string)=>boolean, onVisit: (string)=>string } } fns Whether the tile can be visited and how the state mutates when it does.
   */
  linkTo(tile, linkName, fns = null) {
    linkName = linkName || tile.key;
    if (!fns) {
      fns = {
        canVisit: () => true,
        onVisit: (state) => state
      };
    }
    this._smartLinks.set(linkName, { tile, fns });
  }
}

/**
 * @class {TileMeta} Metadata relating to a `Tile`
 */
class TileMeta {
  /**
   * 
   * @param {Tile} tile 
   * @param {number} distance 
   * @param {string} state 
   */
  constructor(tile, distance, state) {
    this.id = tile.id;
    this.pos = tile.key;
    this.distance = distance;
    this.mapState = state;
    this.previous = new Set();
    this.tile = tile
  }

  /**
   * A key unique to the tile position and map state.
   */
  get keyState() {
    return [this.pos, this.mapState].join('-');
  }

  toString() {
    let key = this.pos !== this.id ? `${this.id}:${this.pos}` : this.pos;
    return `[${this.mapState} + ${key} = ${this.distance}]`;
  }
}

module.exports = { MazeRunner }
