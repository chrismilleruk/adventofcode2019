const { MazeRunner } = require('../lib/mazeRunner')

class TeleportMazeRunner extends MazeRunner {
  static async parse(linesAsync, validTileChars, labelTileChars) {
    const parsedTiles = await MazeRunner.parseTiles(linesAsync, validTileChars, labelTileChars);

    const maze = new TeleportMazeRunner(parsedTiles[validTileChars], validTileChars);

    const specialTiles = new Map(parsedTiles[labelTileChars].map(tile => [tile.key, tile]));
    const links = new Map();

    // This helps us work out if the tile is an outer or an inner tile.
    let bounds = {
      xMin: Infinity,
      xMax: 0,
      yMin: Infinity,
      yMax: 0,
      update: (tile) => {
        bounds.xMin = Math.min(bounds.xMin, tile.x);
        bounds.xMax = Math.max(bounds.xMax, tile.x);
        bounds.yMin = Math.min(bounds.yMin, tile.y);
        bounds.yMax = Math.max(bounds.yMax, tile.y);
      },
      getDist: (tile) => {
        let x = Math.abs(tile.x - bounds.xMin);
        x = Math.min(x, Math.abs(tile.x - bounds.xMax));
        let y = Math.abs(tile.y - bounds.yMin);
        y = Math.min(y, Math.abs(tile.y - bounds.yMax));
        return Math.min(x, y);
      }
    };

    for (const tile1 of specialTiles.values()) {
      let tile2;
      let linkName;

      // Find other label pair. These are horizontal or vertical.
      // e.g.
      //  oX  OR o
      //         X
      let searchKey1 = String([tile1.x, tile1.y + 1]);
      let searchKey2 = String([tile1.x + 1, tile1.y]);

      if (specialTiles.has(searchKey1)) {
        tile2 = specialTiles.get(searchKey1);
        linkName = tile1.char + tile2.char;

        // Look for maze tile that label refers to.
        // Either above or below.
        // e.g.    .
        //         o
        //         X
        //         .
        searchKey1 = String([tile1.x, tile1.y - 1])
        searchKey2 = String([tile1.x, tile1.y + 2])
      }
      
      if (specialTiles.has(searchKey2)) {
        tile2 = specialTiles.get(searchKey2);
        linkName = tile1.char + tile2.char;

        // Look for maze tile that label refers to.
        // Either left or right.
        // e.g.    
        //        .oX. 
        searchKey1 = String([tile1.x - 1, tile1.y])
        searchKey2 = String([tile1.x + 2, tile1.y])
      }

      if (!linkName) continue;

      const mazeTile = maze.get(searchKey1) || maze.get(searchKey2);

      bounds.update(mazeTile);

      if (!links.has(linkName)) links.set(linkName, []);
      links.get(linkName).push(mazeTile);
    }

    for (const [linkName, tiles] of links) {
      if (tiles.length === 1) {
        tiles[0].id = linkName;
        continue;
      }

      // tiles.map(t=>bounds.getDist(t));/*?*/
      tiles.sort((a, b) => bounds.getDist(a) - bounds.getDist(b));
      // links.get(linkName).sort((a, b) => bounds.getDist(a) - bounds.getDist(b));
      // tiles.map(t=>bounds.getDist(t));/*?*/
      // tiles;/*?*/

      tiles.forEach((tile, idx) => {
        let name = linkName + (idx);
        tile.id = name;
      })
    }

    maze._teleportTiles = links;

    return maze;
  }

  linkTiles(generateTeleportFns = null) {
    super.linkTiles(MazeRunner.linkNESW);

    // Create the teleport links
    for (const [linkName, tiles] of this._teleportTiles) {
      if (tiles.length !== 2) continue;

      let tileInner = this.get(tiles[0].id);
      let tileOuter = this.get(tiles[1].id);

      if (generateTeleportFns) {
        let teleportFns = generateTeleportFns(tileOuter, tileInner)
        tileOuter.linkTo(tileInner, linkName, teleportFns.outerFns);
        tileInner.linkTo(tileOuter, linkName, teleportFns.innerFns);
  
      } else {
        tileOuter.linkTo(tileInner, linkName);
        tileInner.linkTo(tileOuter, linkName);
      }

      this.cacheClear();
    }
  }

  static generateTeleportFns(tileOuter, tileInner) {
    function canAlwaysVisit(state) {
      return true;
    }
    function canVisitIfTopLevel(state) {
      return !(state);
    }
    function canVisitIfNotTopLevel(state) {
      return (state > 0);
    }
    function descend(state) {
      return (state || 0) + 1;
    }
    function ascend(state) {
      state = (state || 0) - 1;
      return state;
    }

    return {
      innerFns: { // on traversing outer -> inner
        canVisit: canVisitIfNotTopLevel,
        onVisit: ascend 
      },
      outerFns: { // On traversing inner -> outer
        canVisit: canAlwaysVisit,
        onVisit: descend 
      }
    };
  }
}

module.exports = { TeleportMazeRunner };
