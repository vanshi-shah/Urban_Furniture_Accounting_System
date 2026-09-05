const { Server } = require("socket.io");

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: "*", credentials: true },
  });

  io.on("connection", (socket) => {
    console.log("client connected:", socket.id);
    socket.on("disconnect", () => console.log("client disconnected:", socket.id));
  });

  return io;
}

function getIO() {
  if (!io) {
    return {
      emit: () => {},
      to: () => ({ emit: () => {} })
    };
  }
  return io;
}

module.exports = { initSocket, getIO };
