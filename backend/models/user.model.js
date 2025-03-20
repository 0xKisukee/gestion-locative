const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('owner', 'tenant'),
    allowNull: true,
    defaultValue: 'tenant',
  },
  iban: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'FR76 1234 5678 9101 1121 3141 516', // URGENT: change to true value
  },
  bic: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'AGRIFPPP123', // URGENT: change to true value
  },
}, {
  tableName: 'users',
  createdAt: true,
  updatedAt: false
});

module.exports = User;
