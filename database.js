const { Sequelize } = require('sequelize');
require('dotenv').config();

// Connect to DB with Sequelize
const sequelize = new Sequelize({
    dialect: 'postgres',
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.POSTGRES_DB,
    logging: false
});

module.exports = sequelize;