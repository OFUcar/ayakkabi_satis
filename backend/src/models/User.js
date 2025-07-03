const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Sosyal girişlerde şifre olmayabilir
  },
  provider: {
    type: DataTypes.STRING, // google, instagram, x, local
    allowNull: false,
    defaultValue: 'local',
  },
  providerId: {
    type: DataTypes.STRING, // Sosyal medya ID'si
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user', // admin veya user
  }
});

module.exports = User; 