const mapImage = new Image();
mapImage.src = '/snow.png';

const snowmanImage = new Image();
snowmanImage.src = '/snowman.png';

const santaHat = new Image();
santaHat.src = '/santa-hat.png';

const audio = new Audio('walking-snow.mp3');

const canvasElement = document.getElementById('canvas');
canvasElement.width = window.innerWidth;
canvasElement.height = window.innerHeight;
const canvas = canvasElement.getContext('2d');

const confirm_username = prompt('Enter a username!')

const socket = io();

let groundMap = [[]];
let decalMap = [[]];
let rockMap = [[]];
let roadMap = [[]];

let players = [];
let snowballs = [];
let serverUsernames = [];
const SNOWBALL_RADIUS = 5;

const TILE_SIZE = 16;

socket.on('connect', function(socket) {
  // console.log(socket);
});

socket.emit('user-entered', confirm_username)

socket.on('usernames', (serverUsers) => {
  users = serverUsers;
});

socket.on('map', (loadedMap) => {
  groundMap = loadedMap.ground;
  decalMap = loadedMap.decal;
  roadMap = loadedMap.roads;
  rockMap = loadedMap.rocks;
});

socket.on('players', (serverPlayers) => {
  players = serverPlayers;
});

socket.on('snowballs', (serverSnowballs) => {
  snowballs = serverSnowballs;
});

socket.on('user-saved', (serverUser) => {
  console.log(serverUser)
  serverUsernames = serverUser;
})

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

  let cameraX = 0;
  let cameraY = 0;
  if(myPlayer) {
    cameraX = parseInt(myPlayer.x - canvasElement.width / 2);
    cameraY = parseInt(myPlayer.y - canvasElement.height / 2);
  }

  const TILES_IN_ROW = 16;

  for (let row = 0; row < groundMap.length; row++) {
    for (let col = 0; col < groundMap[0].length; col++) {
      const { id } = groundMap[row][col];
      const imageRow = parseInt(id / TILES_IN_ROW);
      const imageCol = parseInt(id % TILES_IN_ROW);
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

  for (let row = 0; row < roadMap.length; row++) {
    for (let col = 0; col < roadMap[0].length; col++) {
      const { id } = roadMap[row][col] ?? {id: undefined};
      const imageRow = parseInt(id / TILES_IN_ROW);
      const imageCol = parseInt(id % TILES_IN_ROW);
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

  for (let row = 0; row < decalMap.length; row++) {
    for (let col = 0; col < decalMap[0].length; col++) {
      const { id } = decalMap[row][col] ?? {id: undefined};
      const imageRow = parseInt(id / TILES_IN_ROW);
      const imageCol = parseInt(id % TILES_IN_ROW);
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

  for (let row = 0; row < rockMap.length; row++) {
    for (let col = 0; col < rockMap[0].length; col++) {
      const { id } = rockMap[row][col] ?? {id: undefined};
      const imageRow = parseInt(id / TILES_IN_ROW);
      const imageCol = parseInt(id % TILES_IN_ROW);
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
    canvas.drawImage(snowmanImage, player.x - cameraX, player.y - cameraY);
    canvas.drawImage(santaHat, player.x - cameraX + 25, player.y - cameraY + 1, 18, 18);
    canvas.textAlign = "center";
    canvas.fillStyle = "white";
    canvas.font = "20px monospace";

    for(let user of serverUsernames) {
      if(user.id === player.id && user.username) {
        if(user.id === player.id && user.username.length > 0) {
          canvas.fillText(user.username.length > 10 ? user.username.slice(0, 10) + '...' : user.username , player.x - cameraX + 30, player.y - cameraY - 10);
        } else if(user.id === player.id && user.username === null) {
          canvas.fillText(user.username.length > 10 ? user.username.slice(0, 10) + '...' : user.username , player.x - cameraX + 30, player.y - cameraY - 10);
        }
      } else if(user.id === player.id && !user?.username) {
        canvas.fillText(player.id.length > 10 ? player.id.slice(0, 10) + '...' : player.id , player.x - cameraX + 30, player.y - cameraY - 10);
      }
    }
  }

  for(const snowball of snowballs) {
    canvas.fillStyle = "#FFFFFF";
    canvas.strokeStyle = `#212121`;
    canvas.beginPath();
    canvas.arc(snowball.x - cameraX, snowball.y - cameraY, SNOWBALL_RADIUS, 0, 2 * Math.PI);
    canvas.fill();
    canvas.stroke();
  }

  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);