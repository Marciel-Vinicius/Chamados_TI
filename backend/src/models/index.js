const { Sequelize, DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const User = require('./user')(sequelize, DataTypes);
const Ticket = require('./ticket')(sequelize, DataTypes);
const Comment = require('./comment')(sequelize, DataTypes);

// Associações
User.hasMany(Ticket, { foreignKey: 'userId' });
Ticket.belongsTo(User, { foreignKey: 'userId' });

Ticket.hasMany(Comment, { foreignKey: 'ticketId' });
Comment.belongsTo(Ticket, { foreignKey: 'ticketId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Ticket, Comment, Op };
