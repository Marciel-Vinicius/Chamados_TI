// backend/src/config/database.js
const { Sequelize } = require('sequelize');

const url = process.env.DATABASE_URL || 'sqlite://./database.sqlite';

// Habilita SSL só se você definir DATABASE_SSL=true no .env
const dialectOptions = {};
if (process.env.DATABASE_SSL === 'true') {
    dialectOptions.ssl = { require: true, rejectUnauthorized: false };
}

const sequelize = new Sequelize(url, {
    logging: false,
    dialectOptions
});

module.exports = { sequelize };
