const { Server } = require("socket.io");
const gameSocketHandlers = require("./socket/handlers");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: 'https://qalaqobana.vercel.app',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    gameSocketHandlers(io, socket);
  });
}

module.exports = { initSocket };