const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { registerSocketHandlers } = require("./socketHandlers");

const app = express();
const httpServer = http.createServer(app);

// Allow React dev server to connect
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Socket.io server is running");
});

// Register all socket events
registerSocketHandlers(io);

httpServer.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});