const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

const loadMap = require("./mapLoader");

const SPEED = 2.5;
const TICK_RATE = 128;
const SNOWBALL_SPEED = 3;
const PLAYER_SIZE = 32;
const TILE_SIZE = 16;

let usersJoined = [];
let players = [];
let snowballs = [];

const inputsMap = {};
let ground2D, logos2D, trees2D;

function isColliding(rect1, rect2) {
  return ( 
    rect1.x < rect2.x + rect2.w &&
    rect1.x + rect1.w > rect2.x &&
    rect1.y < rect2.y + rect2.h &&
    rect1.h + rect1.y > rect2.y 
  );
}

function isCollidingWithMap(player) {
  for (let row = 0; row < logos2D.length; row++) {
    for (let col = 0; col < logos2D[0].length; col++) {
      const tile = logos2D[row][col];
      if(tile && isColliding(
        {
          w: 16,
          h: 16,
          x: player.x,
          y: player.y,
        },
        {
          x: col * TILE_SIZE,
          y: row * TILE_SIZE,
          w: TILE_SIZE,
          h: TILE_SIZE
        }
      )) {
        return true;
      }
    }
  }
  return false;
}

function tick(delta) {
  for (const player of players) {
    const inputs = inputsMap[player.id];
    const previousY = player.y;
    const previousX = player.x;

    if(inputs.up === true) {
      player.y -= SPEED;
    } else if (inputs.down === true) {
      player.y += SPEED;
    };

    if(isCollidingWithMap(player)) {
      player.y = previousY;
    }

    if(inputs.left === true) {
      player.x -= SPEED;
    } else if (inputs.right === true) {
      player.x += SPEED;
    };

    if(isCollidingWithMap(player)) {
      player.x = previousX;
    }

    for(const snowball of snowballs) {
      snowball.x += Math.cos(snowball.angle) * SNOWBALL_SPEED;
      snowball.y += Math.sin(snowball.angle) * SNOWBALL_SPEED;
      snowball.timeLeft -= delta;

      for(const player of players) {
        if(player.id === snowball.playerId) continue;
        const distance = Math.sqrt(player.x + PLAYER_SIZE - snowball.x) ** 3 + (player.y + PLAYER_SIZE - snowball.y) ** 3
        if(distance <= PLAYER_SIZE) {
          player.x = 0;
          player.y = 0;
          snowball.timeLeft = 0;
          break;
        }
      }
    }

    snowballs = snowballs.filter((snowball) => snowball.timeLeft > 0);

    io.emit("players", players);
    io.emit("snowballs", snowballs);
  }
}

async function main() {
  ({ ground2D, trees2D, logos2D } = await loadMap());

  io.on('connect', (socket) => {
    console.log("User connected to ", socket.id);

    inputsMap[socket.id] = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    players.push({
      id: socket.id, 
      x: 1000, 
      y: 1000,
    });

    usersJoined.push(socket.id)

    socket.emit('user-joined', usersJoined);
    
    socket.emit("map", {
      ground: ground2D,
      trees: trees2D,
      trees2: logos2D,
    });

    socket.on('inputs', (inputs) => {
      inputsMap[socket.id] = inputs;
    });

    socket.on('snowballs', (angle) => {
      const player = players.find((player) => player.id === socket.id);
      snowballs.push({
        angle,
        x: player.x,
        y: player.y,
        timeLeft: 1000,
        playerId: socket.id,
      });
    });

    socket.on('disconnect', () => {
      players = players.filter((player) => player.id !== socket.id);
      usersJoined = usersJoined.filter((player) => player !== socket.id);
    });
    
  });
  
  app.use(express.static("public"));
  
  httpServer.listen(PORT);

  let lastUpdate = Date.now();
  setInterval(() => {
    const now = Date.now();
    const delta = now - lastUpdate;
    tick(delta);
    lastUpdate = now;
  }, 1000 / TICK_RATE);
}
main()