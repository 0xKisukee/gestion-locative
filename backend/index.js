const express = require('express');
require('dotenv').config({ path: '../.env' });
const cors = require('cors');
const cron = require('node-cron');

// Import routes
const userRoutes = require('./routes/user.route');
const propertyRoutes = require('./routes/property.route');
const ticketRoutes = require('./routes/ticket.route');

// Import database
const sequelize = require('./database');

// Import error middleware
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT;

cron.schedule('* * * * *', async () => {
    const { createRentsLoop } = require('./services/payment.service.js');
    try {
        console.log(`Démarrage de la création des nouveaux loyers : ${new Date()}`);
        const payments = await createRentsLoop();
        console.log(`Création des loyers terminée: ${payments.length} paiements créés`);
    } catch (error) {
        console.error(`Erreur lors de la création des loyers: ${error.message}`);
    }
});

// Authorize requests from frontend
app.use(cors({
    origin: 'http://127.0.0.1:5173', // Frontend
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware for JSON requests
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/property', propertyRoutes);
app.use('/api/ticket', ticketRoutes);

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
            "role": "owner",
            "iban": process.env.OWNER_IBAN,
            "bic": process.env.OWNER_BIC
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