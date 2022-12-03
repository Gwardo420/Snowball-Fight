const mapImage = new Image();
mapImage.src = '/snow.png';

const snowmanImage = new Image();
snowmanImage.src = '/snowman.png';

const santaHat = new Image();
santaHat.src = '/santa-hat.png';

const audio = new Audio('walking-snow.mp3');

const canvasElement = document.getElementById('canvas');
console.log(canvasElement)
canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;
const canvas = canvasElement.getContext('2d');

const socket = io();

let groundMap = [[]];
let treeMap = [[]];
let otherTreeMap = [[]];

let joinedMap = [];
let players = [];
let snowballs = [];
const SNOWBALL_RADIUS = 5;

const TILE_SIZE = 16;

socket.on('connect', function(socket) {
  // console.log(socket);
});

socket.on('map', (loadedMap) => {
  groundMap = loadedMap.ground;
  treeMap = loadedMap.trees;
  otherTreeMap = loadedMap.trees2;
});

socket.on('players', (serverPlayers) => {
  players = serverPlayers;
});

socket.on('snowballs', (serverSnowballs) => {
  snowballs = serverSnowballs;
});

socket.on('user-joined', (user) => {
  joinedMap.push(user);
  const playerLength = players.length;
  updateUsers(playerLength);
});

let touchY = '';
let touchX = '';
let touchThreshold = 30;
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

  socket.emit('inputs', inputs);
});

canvasElement.addEventListener('click', (e) => {
  const angle = Math.atan2(
    e.clientY - canvasElement.height / 2,
    e.clientX - canvasElement.width / 2,
  );
  socket.emit('snowballs', angle);
});

function loop() {
  canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);

  const myPlayer = players.find((player) => player.id === socket.id);
  // updateUsers(playerLength);
  
  let cameraX = 0;
  let cameraY = 0;
  if(myPlayer) {
    cameraX = parseInt(myPlayer.x - canvasElement.width / 2);
    cameraY = parseInt(myPlayer.y - canvasElement.height / 2);
  }

  const TILES_IN_ROW = 16;

  for (let row = 0; row < groundMap.length; row++) {
    for (let col = 0; col < groundMap[0].length; col++) {
      const { id } = groundMap[row][col] ?? {id: undefined};
      const imageRow = parseInt(id / TILES_IN_ROW);
      const imageCol = id % TILES_IN_ROW;
      // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      canvas.drawImage(
        mapImage, 
        imageCol * TILE_SIZE,
        imageRow * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        col * TILE_SIZE - cameraX, 
        row * TILE_SIZE - cameraY, 
        TILE_SIZE, 
        TILE_SIZE
      );
      
    }
  }

  for (let row = 0; row < treeMap.length; row++) {
    for (let col = 0; col < treeMap[0].length; col++) {
      const { id } = treeMap[row][col] ?? {id: undefined};
      const imageRow = parseInt(id / TILES_IN_ROW);
      const imageCol = id % TILES_IN_ROW;
      // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      canvas.drawImage(
        mapImage, 
        imageCol * TILE_SIZE,
        imageRow * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        col * TILE_SIZE - cameraX, 
        row * TILE_SIZE - cameraY, 
        TILE_SIZE, 
        TILE_SIZE
      );
      
    }
  }

  for (let row = 0; row < otherTreeMap.length; row++) {
    for (let col = 0; col < otherTreeMap[0].length; col++) {
      const { id } = otherTreeMap[row][col] ?? {id: undefined};
      const imageRow = parseInt(id / TILES_IN_ROW);
      const imageCol = id % TILES_IN_ROW;
      // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      canvas.drawImage(
        mapImage, 
        imageCol * TILE_SIZE,
        imageRow * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE,
        col * TILE_SIZE - cameraX, 
        row * TILE_SIZE - cameraY, 
        TILE_SIZE, 
        TILE_SIZE
      );
      
    }
  }
  
  for(const player of players) {
    canvas.drawImage(snowmanImage, player.x - cameraX - 25, player.y - cameraY);
    canvas.drawImage(santaHat, player.x - cameraX + 1, player.y - cameraY, 18, 18);
    canvas.fillText(player.id.slice(0, 6) + "...", player.x - cameraX - 10, player.y - cameraY - 10);
  }

  for(const snowball of snowballs) {
    canvas.fillStyle = "#FFFFFF";
    canvas.strokeStyle = `#212121`;
    canvas.beginPath();
    canvas.arc(snowball.x - cameraX, snowball.y - cameraY + 50, SNOWBALL_RADIUS, 0, 5 * Math.PI);
    canvas.fill();
    canvas.stroke();
  }

  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);