const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require("../middlewares/authentication")

// Public routes
router.post('/create', userController.createUser);
router.post('/login', userController.login);

// Protected routes
router.get(
    '/myProperty',
    auth.authenticateJwt,
    userController.getProperty,
);

module.exports = router;