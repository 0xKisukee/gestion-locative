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

    // update
    await property.update(data);

    return property;
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

module.exports = {
    createProperty,
    updateProperty,
    getPropertyInfo,
    getOwnerProperties,
};