const { MazeRunner } = require('../lib/mazeRunner')

class TeleportMazeRunner extends MazeRunner {
  static async parse(linesAsync, validTileChars, labelTileChars) {
    const parsedTiles = await MazeRunner.parseTiles(linesAsync, validTileChars, labelTileChars);

    const maze = new TeleportMazeRunner(parsedTiles[validTileChars], validTileChars);

    const specialTiles = new Map(parsedTiles[labelTileChars].map(tile => [tile.key, tile]));
    const links = new Map();

    for (const tile1 of specialTiles.values()) {
      let searchKey1 = String([tile1.x, tile1.y + 1]);
      let searchKey2 = String([tile1.x + 1, tile1.y]);
      let tile2;
      let linkName;

      if (specialTiles.has(searchKey1)) {
        tile2 = specialTiles.get(searchKey1);
        linkName = tile1.char + tile2.char;

        searchKey1 = String([tile1.x, tile1.y - 1])
        searchKey2 = String([tile1.x, tile1.y + 2])
      }
      if (specialTiles.has(searchKey2)) {
        tile2 = specialTiles.get(searchKey2);
        linkName = tile1.char + tile2.char;

        searchKey1 = String([tile1.x - 1, tile1.y])
        searchKey2 = String([tile1.x + 2, tile1.y])
      }

      if (!linkName) continue;

      const mazeTile = maze.get(searchKey1) || maze.get(searchKey2);

      if (!links.has(linkName)) links.set(linkName, []);
      links.get(linkName).push(mazeTile);
    }

    for (const [linkName, tiles] of links) {
      if (tiles.length === 1) {
        tiles[0].id = linkName;
        continue;
      }

      tiles.forEach((tile, idx) => {
        let name = linkName + (idx+1);
        tile.id = name;
      })
    }

    maze._teleportTiles = links;

    return maze;
  }

  linkTiles(generateLinkKeyMap = MazeRunner.linkNESW) {
    super.linkTiles(generateLinkKeyMap);

    // Create the teleport links
    for (const [linkName, tiles] of this._teleportTiles) {
      if (tiles.length !== 2) continue;

      let args = tiles.map(tile => tile.id);
      args.push(linkName);

      this.addLink.apply(this, args);
    }
  }
}

module.exports = { TeleportMazeRunner };
