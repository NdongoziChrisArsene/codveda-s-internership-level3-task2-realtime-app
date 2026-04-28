const { DataTypes } = require("sequelize");
const sequelize     = require("../config/database");

const Message = sequelize.define("Message", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  username: {
    type:      DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type:      DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type:         DataTypes.ENUM("public", "private"),
    defaultValue: "public",
  },
  to: {
    type:      DataTypes.STRING,
    allowNull: true, // null for public messages
  },
});

module.exports = Message;