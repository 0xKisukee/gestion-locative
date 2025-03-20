require('dotenv').config();
const { User } = require("../models");
const { AppError } = require('../middlewares/errorHandler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function createUser(data) {
    // Check if email already exists
    const existingUser = await User.findOne({
        where: { email: data.email }
    });

    if (existingUser) {
        throw new AppError('Email already used', 400);
    }

    const newUser = await User.create(data);

    const { password, ...userWithoutPassword } = newUser.toJSON();
    return userWithoutPassword;
}

async function login(data) {
    const { email, password } = data;

    // Get user with email
    const user = await User.findOne({
        where: { email }
    });

    // Check if user exists
    if (!user) {
        throw new AppError('Wrong email', 400);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError('Wrong password', 401);
    }

    // Generate JWT token with user infos
    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role // 'owner' or 'tenant'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return {
        token,
        user: {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role // MAYBE MOVE THOS RETURN TO JSON DECRYPT ROLE
        }
    };
}
module.exports = {
    createUser,
    login,
};