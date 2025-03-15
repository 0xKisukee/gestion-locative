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
        attributes: { exclude: ['tenantId'] },
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
        return property;
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
        attributes: { exclude: ['tenantId', 'ownerId'] },
        include: [
            {
                model: User,
                as: 'tenant',
                attributes: { exclude: ['password'] } 
            },
        ],
    });

    return properties;
}

module.exports = {
    createProperty,
    updateProperty,
    getPropertyInfo,
    getOwnerProperties,
};