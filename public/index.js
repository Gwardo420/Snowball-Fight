const socket = io('ws://localhost:3000');

socket.on('connect', function(socket) {
  console.log(socket)
})