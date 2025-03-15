const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  detail: {
    type: DataTypes.ENUM('house', 'apartment'),
    allowNull: false,
    defaultValue: 'apartment',
  },
  rent: { // monthly price
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  surface: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tenantId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null = available
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.VIRTUAL,
    get() {
      if (this.getDataValue('tenantId') == null) {
        return "free"
      } else {
        return "rented"
      }
    }
  }
}, {
  tableName: 'properties',
  timestamps: false,
});

module.exports = Property;
