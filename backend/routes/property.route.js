const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const auth = require("../middlewares/authentication")

// Public routes

// Protected routes
router.post(
    '/create',
    auth.authenticateJwt,
    propertyController.createProperty,
);

// dev purpose
router.patch(
    '/update/:propertyId',
    auth.authenticateJwt,
    propertyController.updateProperty,
);

router.delete(
    '/delete/:propertyId',
    auth.authenticateJwt,
    propertyController.deleteProperty,
);

router.patch(
    '/:propertyId/setTenant/:tenantId',
    auth.authenticateJwt,
    propertyController.setTenant,
);

router.patch(
    '/:propertyId/removeTenant',
    auth.authenticateJwt,
    propertyController.removeTenant,
);

router.get(
    '/getInfos/:propertyID',
    auth.authenticateJwt,
    propertyController.getPropertyInfo,
);

router.get(
    '/getMyProperties',
    auth.authenticateJwt,
    propertyController.getOwnerProperties,
);

module.exports = router;