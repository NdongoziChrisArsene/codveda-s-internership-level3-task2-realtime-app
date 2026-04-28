const sequelize = require("../config/database");
const User      = require("./User");
const Message   = require("./Message");

// Sync all models — creates tables if they don't exist
const syncDatabase = async () => {
  await sequelize.sync({ alter: true });
  console.log("✅ PostgreSQL tables synced");
};

module.exports = { sequelize, User, Message, syncDatabase };