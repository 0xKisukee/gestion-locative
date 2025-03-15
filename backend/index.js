const express = require('express');
require('dotenv').config();
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/user.route');
const propertyRoutes = require('./routes/property.route');

// Import database
const sequelize = require('./database');

// Import error middleware
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT;

// Authorize requests from frontend
app.use(cors({
    origin: 'http://frontend:80', // Frontend
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

// Middleware for JSON requests
app.use(express.json());

//Serve static files of frontend
app.use(express.static('../frontend'));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/property', propertyRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('Bienvenue sur votre application de gestion locative.');
});

// Use error middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server live on port ${PORT}.`);
});

// Create tables in database and admin user
(async () => {
    const { User } = require("./models");
    const bcrypt = require('bcrypt');

    await sequelize.sync({ force: true/*, logging: console.log*/ });
    console.log('Tables successfully created.');

    // Create 2 users
    const hashedPassword = await bcrypt.hash(process.env.OWNER_PWD, 10);
    await User.create(
        {
            "username": process.env.OWNER_USERNAME,
            "email": process.env.OWNER_EMAIL,
            "password": hashedPassword,
            "role": "owner"
        }
    );
    await User.create(
        {
            "username": process.env.TENANT_USERNAME,
            "email": process.env.TENANT_EMAIL,
            "password": hashedPassword,
            "role": "tenant"
        }
    );
})();