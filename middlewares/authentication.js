require('dotenv').config();
const { expressjwt: expressJwt } = require('express-jwt');
const { AppError } = require('./errorHandler');

// Middleware: JWT Token verification
const authenticateJwt = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
});

// Middleware: Capture JWT errors
const handleJwtErrors = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        // express-jwt errors are of type UnauthorizedError
        throw new AppError('Authentication error caught on expressJwt', 401);
    }
    next(err);
};

// Middleware: Admin verification
const isAdmin = (req, res, next) => {
    // req.auth is given bt express-jwt and contains decrypted token data
    if (req.auth && req.auth.role === 'admin') {
        return next();
    }

    throw new AppError('Access denied: you need to be admin', 403);
};

// Middleware: Check if user is requesting his own resources
const isOwnResource = (req, res, next) => {
    // Convert IDs to strings
    const requestedUserId = String(req.params.userID);
    const tokenUserId = String(req.auth.userId);

    if (req.auth && (req.auth.role === 'admin' || tokenUserId === requestedUserId)) {
        return next();
    }
    
    throw new AppError('Access denied: you can only access your resources', 403);
};

module.exports = {
    authenticateJwt,
    handleJwtErrors,
    isAdmin,
    isOwnResource,
}