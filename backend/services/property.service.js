require('dotenv').config();
const { Property, User } = require("../models");
const { AppError } = require('../middlewares/errorHandler');

async function createProperty(userId, data) {
    const { detail, rent, surface, city, address } = data;

    // Verify that owner has "owner" role
    const owner = await User.findByPk(userId);
    if (!owner || owner.role !== "owner") {
        throw new AppError('User needs the "owner" role', 400);
    }

    // Create property
    const property = await Property.create({
        detail,
        rent,
        surface,
        city,
        address,
        ownerId: userId,
    });

    return property;
}

async function updateProperty(userId, propertyId, data) {
    // Get property with owner association
    const property = await Property.findOne({
        where: { id: propertyId, ownerId: userId }
    });

    // Verify property existence and ownership
    if (!property) {
        throw new AppError('Property not found or you are not the owner', 404);
    }

    // Verify if new tenant already has a property
    const { tenantId } = data;
    if (tenantId) {
        const existingProperty = await Property.findOne({
            where: { tenantId }
        });
        if (existingProperty) {
            throw new AppError('Tenant already lives in a property', 400);
        }
    }

    // update
    await property.update(data);

    return property;
}

async function deleteProperty(userId, propertyId) {
    // Get property with owner association
    const property = await Property.findOne({
        where: { id: propertyId, ownerId: userId }
    });

    // Verify property existence and ownership
    if (!property) {
        throw new AppError('Property not found or you are not the owner', 404);
    }

    // Check if property has a tenant
    if (property.tenantId !== null) {
        throw new AppError('Cannot delete a property that has a tenant. Please remove the tenant first.', 400);
    }

    // Soft delete by setting ownerId to null
    await property.update({ ownerId: null });

    return true;
}

async function getPropertyInfo(userId, propertyId) {
    // Get property with associations
    const property = await Property.findOne({
        where: { id: propertyId, ownerId: userId },
        include: [
            {
                model: User,
                as: 'tenant',
                attributes: { exclude: ['password'] }
            }
        ]
    });

    if (!property) {
        throw new AppError('Property not found or you are not the owner', 404);
    }

    // Create JSON object and delete useless parameters
    const propertyJson = property.toJSON();
    delete propertyJson.tenantId;
    delete propertyJson.ownerId;

    return propertyJson;
}

async function getOwnerProperties(userId) {
    const owner = await User.findByPk(userId);

    // Verify owner role
    if (!owner || owner.role !== 'owner') {
        throw new AppError('User must have the "owner" role', 400);
    }

    // Get all properties of owner using association
    const properties = await owner.getOwnedProperties({
        include: [
            {
                model: User,
                as: 'tenant',
                attributes: { exclude: ['password'] }
            }
        ]
    });

    // Transform each property to delete useless attributes
    const transformedProperties = properties.map(property => {
        const propertyJson = property.toJSON();
        delete propertyJson.ownerId;
        delete propertyJson.tenantId;
        return propertyJson;
    });

    return transformedProperties;
}

async function getPropertyByTenantId(userId) {
    // If userId is null, return (used to remove tenant from property)
    if (userId === null) {
        return false;
    }

    // Verify that user has "tenant" role
    const tenant = await User.findByPk(userId);
    if (!tenant || tenant.role !== "tenant") {
        throw new AppError('User needs the "tenant" role', 400);
    }

    // Get property using tenant association
    const property = await tenant.getRentedProperty({
        include: [{
            model: User,
            as: 'owner',
            attributes: { exclude: ['password'] }
        }]
    });

    if (!property) {
        return false;
    }

    return property;
}

module.exports = {
    createProperty,
    updateProperty,
    deleteProperty,
    getPropertyInfo,
    getOwnerProperties,
    getPropertyByTenantId,
};