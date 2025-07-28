const { Sequelize } = require('sequelize');
const url = process.env.DATABASE_URL || 'sqlite://./database.sqlite';
const sequelize = new Sequelize(url, { logging: false });
module.exports = { sequelize };
