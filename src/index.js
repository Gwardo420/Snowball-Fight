const express = require('express');
const { createServer } = require("http");
const { resolve } = require('path');
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer);
const loadMap = require("./mapLoader");

async function main() {
  const map2D = await loadMap();

  io.on('connect', (socket) => {
    console.log("User connected to ", socket.id);
  
    socket.emit("map", map2D);
  });
  
  app.use(express.static("public"));
  
  httpServer.listen(3000);
}
main()