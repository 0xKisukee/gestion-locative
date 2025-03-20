const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // false = due but not yet paid
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
  propertyId: { // remove this ???
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.VIRTUAL,
    get() {

      // If paid date is defined, payment is paid
      if (this.getDataValue('isPaid') === true) {
        return "paid"
        
      // If today date is later than due date, payment is due
      } else if (new Date() > this.getDataValue('dueDate')) {
        return "due"

      // If today date is earlier than due date, payment is incoming
      } else {
        return "incoming"
      }
    }
  }
}, {
  tableName: 'payments',
  createdAt: true,
  updatedAt: false
});

module.exports = Payment;
