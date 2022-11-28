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
  const decalTiles = map.layers[3].tiles;
  const roadTiles = map.layers[1].tiles;
  const rockTiles = map.layers[2].tiles;
  const ground2D = [];
  const decal2D = [];
  const road2D = [];
  const rock2D = [];

  for(let row = 0; row < map.height; row++) {
    const groundRow = [];
    const decalRow = [];
    const roadRow = [];
    const rockRow = [];

    for(let col = 0; col < map.width; col++) {
      const ground = groundTiles[row * map.height + col];
      groundRow.push({ id: ground.id, gid: ground.gid });

      const decalTile = decalTiles[row * map.height + col];
      if(decalTile) {
        decalRow.push({ id: decalTile.id, gid: decalTile.gid });
      } else {
        decalRow.push(undefined);
      }

      const roadTile = roadTiles[row * map.height + col];
      if(roadTile) {
        roadRow.push({ id: roadTile.id, gid: roadTile.gid });
      } else {
        roadRow.push(undefined);
      }

      const rockTile = rockTiles[row * map.height + col];
      if(rockTile) {
        rockRow.push({ id: rockTile.id, gid: rockTile.gid });
      } else {
        rockRow.push(undefined);
      }
    }
    ground2D.push(groundRow);
    decal2D.push(decalRow);
    road2D.push(roadRow);
    rock2D.push(rockRow);
  }

  return {
    ground2D,
    decal2D,
    road2D,
    rock2D
  };
}

module.exports = loadMap;