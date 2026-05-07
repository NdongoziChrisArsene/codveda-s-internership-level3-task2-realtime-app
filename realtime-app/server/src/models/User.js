const { DataTypes } = require("sequelize");
const bcrypt        = require("bcryptjs");
const sequelize     = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type:         DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey:   true,
  },
  username: {
    type:      DataTypes.STRING,
    allowNull: false,
    unique:    true,
    trim:      true,
  },
  email: {
    type:      DataTypes.STRING,
    allowNull: false,
    unique:    true,
    validate:  { isEmail: true },
  },
  password: {
    type:      DataTypes.STRING,
    allowNull: false,
  },
});

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 12);
});

User.prototype.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = User;