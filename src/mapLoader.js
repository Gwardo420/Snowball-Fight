const tmx = require('tmx-parser');

async function loadMap() {
  const map = await new Promise((resolve, reject) => {
    tmx.parseFile("./src/map.tmx", function (err, loadedMap) {
      if (err) return reject(err);
      resolve(loadedMap);
    });
  });

  const layer = map.layers[0];
  const groundTiles = layer.tiles;
  const treeTiles = map.layers[1].tiles;
  const otherTrees = map.layers[2].tiles;
  
  const trees2D = [];
  const ground2D = [];
  const logos2D = [];

  for(let row = 0; row < map.height; row++) {
    const groundRow = [];
    const treeRow = [];
    const otherTreeRow = [];

    for(let col = 0; col < map.width; col++) {
      const ground = groundTiles[row * map.height + col];
      if(ground) {
        groundRow.push({ id: ground.id, gid: ground.gid });
      } else {
        groundRow.push(undefined)
      }

      const treeTile = treeTiles[row * map.height + col];
      if(treeTile) {
        treeRow.push({ id: treeTile.id, gid: treeTile.gid });
      } else {
        treeRow.push(undefined);
      }

      const otherTreeTiles = otherTrees[row * map.height + col];
      if(otherTreeTiles) {
        otherTreeRow.push({ id: otherTreeTiles.id, gid: otherTreeTiles.gid });
      } else {
        otherTreeRow.push(undefined);
      }
    }
    trees2D.push(treeRow);
    ground2D.push(groundRow);
    logos2D.push(otherTreeRow);
  }

  return {
    ground2D,
    trees2D,
    logos2D
  };
}

module.exports = loadMap;