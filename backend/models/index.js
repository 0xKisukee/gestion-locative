// Import models
const User = require('./user.model');
const Property = require('./property.model');
const Payment = require('./payment.model');
const Ticket = require('./ticket.model');
const Message = require('./message.model');

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

// An owner can have multiple properties
User.hasMany(Property, {
  foreignKey: 'ownerId',
  as: 'ownedProperties',
  constraints: false // to verify
});
// A property can only belong to one owner
Property.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner',
  constraints: false // to verify
});

// A tenant can have multiple payments
User.hasMany(Payment, {
  foreignKey: 'tenantId',
  as: 'tenantPayments',
  constraints: false // to verify
});
// A payment can only belong to one tenant
Payment.belongsTo(User, {
  foreignKey: 'tenantId',
  as: 'paymentTenant',
  constraints: false // to verify
});

// An owner can have multiple payments
User.hasMany(Payment, {
  foreignKey: 'ownerId',
  as: 'ownerPayments',
  constraints: false // to verify
});
// A payment can only belong to one owner
Payment.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'paymentOwner',
  constraints: false // to verify
});

// A property can have multiple payments
Property.hasMany(Payment, {
  foreignKey: 'propertyId',
  as: 'propertyPayments',
  constraints: false // to verify
});
// A payment belongs to one property
Payment.belongsTo(Property, {
  foreignKey: 'propertyId',
  as: 'paymentProperty',
  constraints: false // to verify
});

// Ticket associations
Ticket.belongsTo(User, { as: 'tenant', foreignKey: 'tenantId' });
Ticket.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
Ticket.belongsTo(Property, { foreignKey: 'propertyId' });
Ticket.hasMany(Message, { foreignKey: 'ticketId' });

// Message associations
Message.belongsTo(Ticket, { foreignKey: 'ticketId' });
Message.belongsTo(User, { foreignKey: 'userId' });

// User associations to tickets
User.hasMany(Ticket, { as: 'tenantTickets', foreignKey: 'tenantId' });
User.hasMany(Ticket, { as: 'ownerTickets', foreignKey: 'ownerId' });

// Export all models
module.exports = {
  User,
  Property,
  Payment,
  Ticket,
  Message
};