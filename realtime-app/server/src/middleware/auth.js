const jwt = require("jsonwebtoken");

const getUser = (req) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

const requireAuth = (context) => {
  if (!context.user)
    throw new Error("Authentication required. Please log in.");
  return context.user;
};

module.exports = { getUser, requireAuth };