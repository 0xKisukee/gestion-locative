const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property.controller');
const auth = require("../middlewares/authentication")

// Public routes

// Protected routes
// All routes require authentication
router.use(auth.authenticateJwt);

router.post(
    '/create',
    propertyController.createProperty,
);

// dev purpose
router.patch(
    '/update/:propertyId',
    propertyController.updateProperty,
);

router.delete(
    '/delete/:propertyId',
    propertyController.deleteProperty,
);

router.patch(
    '/:propertyId/setTenant/:tenantId',
    propertyController.setTenant,
);

router.patch(
    '/:propertyId/removeTenant',
    propertyController.removeTenant,
);

router.get(
    '/getInfos/:propertyID',
    propertyController.getPropertyInfo,
);

router.get(
    '/getMyProperties',
    propertyController.getOwnerProperties,
);

module.exports = router;