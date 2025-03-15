// Import models
const User = require('./user.model');
const Property = require('./property.model');

// A tenant can only have one property
User.hasOne(Property, {
  foreignKey: 'tenantId',
  as: 'rentedProperty',
  constraints: false // to verify
});

// A property can only have one tenant
Property.belongsTo(User, {
  foreignKey: 'tenantId',
  as: 'tenant',
  constraints: false // to verify
});

// Export all models
module.exports = {
  User,
  Property,
};