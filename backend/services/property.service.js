require('dotenv').config();
const { Property, User } = require("../models");
const { AppError } = require('../middlewares/errorHandler');

async function createProperty(userId, data) {
    const { detail, rent, surface, city, address } = data;

    // Verfy that owner has "owner" role
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
    // Get property by id
    const property = await Property.findByPk(propertyId);

    // Verify property existence
    if (!property) {
        throw new AppError('Property not found', 404);
    }

    // Verify user ownership
    if (userId !== property.ownerId) {
        throw new AppError('You are not the owner of this property', 403);
    }

    // Verify if new tenant already has a property
    const { tenantId } = data;
    const existingProperty = await getPropertyByTenantId(tenantId);
    if (existingProperty) {
        throw new AppError('Tenant already lives in a property', 400);
    }

    // update
    await property.update(data);

    return property;
}

async function deleteProperty(userId, propertyId) {
    // Get property by id
    const property = await Property.findByPk(propertyId);

    // Verify property existence
    if (!property) {
        throw new AppError('Property not found', 404);
    }

    // Verify user ownership
    if (userId !== property.ownerId) {
        throw new AppError('You are not the owner of this property', 403);
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
    // Get property informations by id
    const property = await Property.findByPk(propertyId, {
        include: [
            {
                model: User,
                as: 'tenant',
                attributes: { exclude: ['password'] }
            },
        ],
    });

    if (!property) {
        throw new AppError('Property not found', 404);
    }

    // Verify user ownership, then return property
    if (userId !== property.ownerId) {
        throw new AppError('You are not the owner of this property', 403);
    } else {
        // Create JSON object and delete useless parameters
        const propertyJson = property.toJSON();
        delete propertyJson.tenantId;

        return propertyJson;
    }
}

async function getOwnerProperties(userId) {
    const owner = await User.findByPk(userId);

    // Verify owner role
    if (!owner || owner.role !== 'owner') {
        throw new AppError('User must have the "owner" role', 400);
    }

    // Get all properties of owner
    const properties = await Property.findAll({
        where: { ownerId: userId },
        include: [
            {
                model: User,
                as: 'tenant',
                attributes: { exclude: ['password'] }
            },
        ],
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
    // Verfy that user has "tenant" role
    const tenant = await User.findByPk(userId);
    if (!tenant || tenant.role !== "tenant") {
        throw new AppError('User needs the "tenant" role', 400);
    }

    // Finds a property with the corresponding tenant id
    const property = await Property.findOne({
        where: {
            tenantId: userId
        },
        attributes: { exclude: ['ownerId'] },
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