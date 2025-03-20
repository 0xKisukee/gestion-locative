const userService = require('../services/user.service.js');
const propertyService = require('../services/property.service.js');
const paymentService = require('../services/payment.service.js');
const bcrypt = require('bcrypt');

async function login(req, res, next) {
    try {
        const result = await userService.login(req.body);

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
        // Find the property where this user is tenant
        const property = await propertyService.getPropertyByTenantId(req.auth.userId);

        res.json(property);
    } catch (err) {
        next(err);
    }
}

async function getPayments(req, res, next) {
    try {
        const userId = req.auth.userId;
        let payments;

        if (req.auth.role === "owner") {
            // Get owner payments
            payments = await paymentService.getOwnerPayments(userId);
        } else if (req.auth.role === "tenant") {
            // Get tenant payments
            payments = await paymentService.getTenantPayments(userId);
        } else {
            console.log("WTF why am I here?")
        }

        res.json(payments);
    } catch (err) {
        next(err);
    }
}

async function recordPayment(req, res, next) {
    try {
        // Update property
        const updatedPayment = await paymentService.recordPayment(req.auth.userId, req.params.paymentId);

        res.json(updatedPayment);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createUser,
    login,
    getProperty,
    getPayments,
    recordPayment,
};