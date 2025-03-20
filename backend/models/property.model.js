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
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: true, // null = deleted by owner
    references: {
      model: 'users',
      key: 'id'
    }
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
  createdAt: true,
  updatedAt: false
});

// Verify owner hook at creation
Property.beforeCreate(async (property) => {
  const User = require('./user.model'); // Import User here to avoid circular references
  
  const owner = await User.findByPk(property.ownerId);
  if (!owner || owner.role !== 'owner') {
    throw new Error('Owner needs "owner" role');
  }
  
  // No tenant verification at creation
  // Tenant is added in another usecase (updateProperty)
});

// Verify owner and tenant hook at update
Property.beforeUpdate(async (property) => {
  const User = require('./user.model');
  
  // Verify tenant only on update
  if (property.changed('tenantId') && property.tenantId) {
    const tenant = await User.findByPk(property.tenantId);
    if (!tenant || tenant.role !== 'tenant') {
      throw new Error('Tenant needs "tenant" role');
    }
  }
});

module.exports = Property;
