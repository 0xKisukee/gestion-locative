const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require("../middlewares/authentication")

// Public routes
router.post('/create', userController.createUser);
router.post('/login', userController.login);

// Next routes require authentication (remove in each route)
// router.use(auth.authenticateJwt);

// Protected routes
router.get(
    '/myProperty',
    auth.authenticateJwt,
    userController.getProperty,
);

router.get(
    '/myPayments',
    auth.authenticateJwt,
    userController.getPayments,
);

router.patch(
    '/recordPayment/:paymentId',
    auth.authenticateJwt,
    userController.recordPayment,
);

router.get(
    '/me',
    auth.authenticateJwt,
    userController.getUser,
);

module.exports = router;