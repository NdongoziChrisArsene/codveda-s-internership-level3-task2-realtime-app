require("dotenv").config();
const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const cors       = require("cors");
const jwt        = require("jsonwebtoken");

const { syncDatabase }           = require("./models");
const { registerSocketHandlers } = require("./socketHandlers");
const authRoutes                 = require("./routes/auth");

const app        = express();
const httpServer = http.createServer(app);

// --- Socket.io server -----------------------
const io = new Server(httpServer, {
  cors: {
    origin:  "http://localhost:5174",  // ← updated from 5173
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: "http://localhost:5174"      // ← updated from 5173
}));
app.use(express.json());
app.use("/auth", authRoutes);

// --- JWT Socket Handshake Middleware -------------
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token)
    return next(new Error("Authentication error: No token provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // attach { userId, username } to socket
    next();
  } catch {
    next(new Error("Authentication error: Invalid or expired token"));
  }
});

registerSocketHandlers(io);

// --- Sync PostgreSQL tables then start server ---------------
syncDatabase().then(() => {
  httpServer.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
  });
}).catch(console.error);








































































































































// require("dotenv").config();
// const express    = require("express");
// const http       = require("http");
// const { Server } = require("socket.io");
// const cors       = require("cors");
// const jwt        = require("jsonwebtoken");

// const { syncDatabase }           = require("./models");
// const { registerSocketHandlers } = require("./socketHandlers");
// const authRoutes                 = require("./routes/auth");

// const app        = express();
// const httpServer = http.createServer(app);

// // ── Socket.io server ────────────────────────────────────
// const io = new Server(httpServer, {
//   cors: {
//     origin:  "http://localhost:5173",
//     methods: ["GET", "POST"],
//   },
// });

// app.use(cors());
// app.use(express.json());
// app.use("/auth", authRoutes);

// // ── JWT Socket Handshake Middleware ──────────────────────
// // Runs before every socket connection is accepted
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;

//   if (!token)
//     return next(new Error("Authentication error: No token provided"));

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     socket.user = decoded; // attach { userId, username } to socket
//     next();
//   } catch {
//     next(new Error("Authentication error: Invalid or expired token"));
//   }
// });

// registerSocketHandlers(io);

// // ── Sync PostgreSQL tables then start server ─────────────
// syncDatabase().then(() => {
//   httpServer.listen(process.env.PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
//   });
// }).catch(console.error);