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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

const io = new Server(httpServer, {
  cors: {
    origin:  allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: allowedOrigins,
}));
app.use(express.json());
app.use("/auth", authRoutes);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token)
    return next(new Error("Authentication error: No token provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Authentication error: Invalid or expired token"));
  }
});

registerSocketHandlers(io);

syncDatabase().then(() => {
  httpServer.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
  });
}).catch(console.error);