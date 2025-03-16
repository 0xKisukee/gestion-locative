const propertyService = require('../services/property.service.js');

async function createProperty(req, res, next) {
    try {
        const newProperty = await propertyService.createProperty(req.auth.userId, req.body);

        // Return property
        res.json(newProperty);
    } catch (err) {
        next(err);
    }
}

//dev purpose
async function updateProperty(req, res, next) {
    try {
        // Update property
        const updatedProperty = await propertyService.updateProperty(req.auth.userId, req.params.propertyId, req.body);

        res.json(updatedProperty);
    } catch (err) {
        next(err);
    }
}

async function deleteProperty(req, res, next) {
    try {
        // Delete property
        const updatedProperty = await propertyService.deleteProperty(req.auth.userId, req.params.propertyId);

        res.json(updatedProperty);
    } catch (err) {
        next(err);
    }
}

async function setTenant(req, res, next) {
    try {
        // Update property
        const tenantId = req.params.tenantId;

        const updatedProperty = await propertyService.updateProperty(req.auth.userId, req.params.propertyId, { tenantId: tenantId });

        res.json(updatedProperty);
    } catch (err) {
        next(err);
    }
}

async function removeTenant(req, res, next) {
    try {
        // Update property
        const updatedProperty = await propertyService.updateProperty(req.auth.userId, req.params.propertyId, { tenantId: null });

        res.json(updatedProperty);
    } catch (err) {
        next(err);
    }
}

async function getPropertyInfo(req, res, next) {
    try {

        // Get property infos
        const infos = await propertyService.getPropertyInfo(req.auth.userId, req.params.propertyID);

        res.json(infos);
    } catch (err) {
        next(err);
    }
}

async function getOwnerProperties(req, res, next) {
    try {

        // Get owner's properties
        const OwnerProperties = await propertyService.getOwnerProperties(req.auth.userId);

        res.json(OwnerProperties);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createProperty,
    updateProperty,
    deleteProperty,
    setTenant,
    removeTenant,
    getPropertyInfo,
    getOwnerProperties,
};