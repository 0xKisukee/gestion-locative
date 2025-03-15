const userService = require('../services/user.service.js');
const propertyService = require('../services/property.service.js');
const bcrypt = require('bcrypt');

async function login(req, res, next) {
    try {
        const result  = await userService.login(req.body);

        // Destructure the result to get token and user
        const { token, user } = result;

        // Renvoyer le token au client
        res.json({ token, user });
    } catch (err) {
        next(err);
    }
}

async function createUser(req, res, next) {
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;

        // Create user
        const userWithoutPwd = await userService.createUser(req.body);

        res.json(userWithoutPwd);
    } catch (err) {
        next(err);
    }
}

async function getProperty(req, res, next) {
    try {
        const userId = req.auth.userId;

        // Find the property where this user is tenant
        const property = await propertyService.getPropertyByTenantId(userId);

        res.json(property);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createUser,
    login,
    getProperty,
};