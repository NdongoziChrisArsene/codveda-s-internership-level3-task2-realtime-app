const { Message } = require("./models");

const connectedUsers = {}; 

function registerSocketHandlers(io) {
  io.on("connection", async (socket) => {
    const username = socket.user.username; 
    connectedUsers[socket.id] = username;

    socket.join(`user:${username}`);
    console.log(`✅ ${username} connected`);

    const history = await Message.findAll({
      where:  { type: "public" },
      order:  [["createdAt", "ASC"]],
      limit:  50,
    });

    socket.emit("chat:history", history);

    io.emit("notification", {
      type:    "info",
      message: `${username} has joined the chat`,
    });

    io.emit("users:update", Object.values(connectedUsers));

    socket.on("chat:message", async (message) => {
      const saved = await Message.create({
        username,
        message,
        type: "public",
      });

      io.emit("chat:message", {
        username,
        message,
        timestamp: saved.createdAt.toISOString(),
      });
    });

    socket.on("notify:user", async ({ targetUsername, message }) => {
      await Message.create({
        username,
        message,
        type: "private",
        to:   targetUsername,
      });

      io.to(`user:${targetUsername}`).emit("notification", {
        type:    "private",
        message: `📩 ${username}: ${message}`,
      });
    });

    socket.on("typing:start", () => {
      socket.broadcast.emit("typing:update", { username, isTyping: true });
    });

    socket.on("typing:stop", () => {
      socket.broadcast.emit("typing:update", { username, isTyping: false });
    });

    socket.on("disconnect", () => {
      delete connectedUsers[socket.id];

      io.emit("notification", {
        type:    "warning",
        message: `${username} has left the chat`,
      });

      io.emit("users:update", Object.values(connectedUsers));

      socket.broadcast.emit("typing:update", { username, isTyping: false });

      console.log(`❌ ${username} disconnected`);
    });
  });
}

module.exports = { registerSocketHandlers };