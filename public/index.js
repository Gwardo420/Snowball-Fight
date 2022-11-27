const mapImage = new Image();
mapImage.src = '/snow.png';

const snowmanImage = new Image();
snowmanImage.src = '/snowman.png';

const canvasElement = document.getElementById('canvas');
canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;
const canvas = canvasElement.getContext('2d');

const socket = io('ws://localhost:3000');

let map = [[]];
let players = [];

const TILE_SIZE = 32;

socket.on('connect', function(socket) {
  console.log(socket);
});

socket.on('map', (loadedMap) => {
  map = loadedMap;
});

socket.on('players', (serverPlayers) => {
  players = serverPlayers;
})

const inputs = {
  up: false, 
  down: false, 
  left: false, 
  right: false,
};

window.addEventListener('keydown', (e) => {
  if(e.key === "w") {
    inputs["up"] = true;
  } else if(e.key === "s") {
    inputs["down"] = true;
  } else if(e.key === "d") {
    inputs["right"] = true;
  } else if(e.key === "a") {
    inputs["left"] = true;
  }
  socket.emit('inputs', inputs)
});

window.addEventListener('keyup', (e) => {
  if(e.key === "w") {
    inputs["up"] = false;
  } else if(e.key === "s") {
    inputs["down"] = false;
  } else if(e.key === "d") {
    inputs["right"] = false;
  } else if(e.key === "a") {
    inputs["left"] = false;
  }
  socket.emit('inputs', inputs)
});

function loop() {
  canvas.clearRect(0, 0, canvas.width, canvas.height)
  
  const TILES_IN_ROW = 16;

  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[0].length; col++) {
      const { id } = map[row][col];
      const imageRow = parseInt(id / TILES_IN_ROW);
      const imageCol = id % TILES_IN_ROW;

      // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      
      canvas.drawImage(
        mapImage, 
        imageCol * TILE_SIZE,
        imageRow * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        col * TILE_SIZE, 
        row * TILE_SIZE, 
        TILE_SIZE, 
        TILE_SIZE
      )
    }
  }

  // canvas.drawImage(snowmanImage, 0, 0)

  for(const player of players) {
    canvas.drawImage(snowmanImage, player.x, player.y)
  }

  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);