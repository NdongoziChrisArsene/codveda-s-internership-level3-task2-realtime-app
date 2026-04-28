// Tracks connected users: { socketId -> username }
const connectedUsers = {};

function registerSocketHandlers(io) {

  io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);

    // ── 1. User joins with a username ──────────────────────────
    socket.on("user:join", (username) => {
      connectedUsers[socket.id] = username;

      // Join a personal room for private notifications
      socket.join(`user:${username}`);

      console.log(`${username} joined`);

      // Notify everyone that a new user joined
      io.emit("notification", {
        type: "info",
        message: `${username} has joined the chat`,
      });

      // Send updated user list to all clients
      io.emit("users:update", Object.values(connectedUsers));
    });

    // ── 2. Chat message (broadcast to everyone) ────────────────
    socket.on("chat:message", (message) => {
      const username = connectedUsers[socket.id] || "Anonymous";

      io.emit("chat:message", {
        username,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    // ── 3. Private notification to a specific user ─────────────
    socket.on("notify:user", ({ targetUsername, message }) => {
      const senderUsername = connectedUsers[socket.id];

      // Send only to the target user's personal room
      io.to(`user:${targetUsername}`).emit("notification", {
        type: "private",
        message: `📩 ${senderUsername}: ${message}`,
      });
    });

    // ── 4. Handle disconnect ───────────────────────────────────
    socket.on("disconnect", () => {
      const username = connectedUsers[socket.id];
      if (username) {
        delete connectedUsers[socket.id];

        io.emit("notification", {
          type: "warning",
          message: `${username} has left the chat`,
        });

        io.emit("users:update", Object.values(connectedUsers));
      }
      console.log(`Disconnected: ${socket.id}`);
    });
  });
}

module.exports = { registerSocketHandlers };