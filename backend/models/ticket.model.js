const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  propertyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id'
    }
  },
  category: {
    type: DataTypes.ENUM('repair', 'payment', 'other'),
    allowNull: false,
    defaultValue: 'other'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('opened', 'closed'),
    allowNull: false,
    defaultValue: 'opened'
  }
}, {
  tableName: 'tickets',
  timestamps: true
});

module.exports = Ticket;