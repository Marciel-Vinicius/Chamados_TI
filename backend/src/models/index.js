// backend/src/models/index.js
const { Sequelize, DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const User = require('./user')(sequelize, DataTypes);
const Ticket = require('./ticket')(sequelize, DataTypes);
const Comment = require('./comment')(sequelize, DataTypes);
const Category = require('./category')(sequelize, DataTypes);
const Priority = require('./priority')(sequelize, DataTypes);
const Reason = require('./reason')(sequelize, DataTypes);
const Sector = require('./sector')(sequelize, DataTypes);

// Associações
User.hasMany(Ticket, { foreignKey: 'userId' });
Ticket.belongsTo(User, { foreignKey: 'userId' });

Ticket.hasMany(Comment, { foreignKey: 'ticketId' });
Comment.belongsTo(Ticket, { foreignKey: 'ticketId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(Ticket, { foreignKey: 'categoryId' });
Ticket.belongsTo(Category, { foreignKey: 'categoryId' });

Priority.hasMany(Ticket, { foreignKey: 'priorityId' });
Ticket.belongsTo(Priority, { foreignKey: 'priorityId' });

Reason.hasMany(Ticket, { foreignKey: 'reasonId' });
Ticket.belongsTo(Reason, { foreignKey: 'reasonId' });

Sector.hasMany(User, { foreignKey: 'sectorId' });
User.belongsTo(Sector, { foreignKey: 'sectorId' });

module.exports = {
    sequelize,
    User,
    Ticket,
    Comment,
    Category,
    Priority,
    Reason,
    Sector,
    Op
};
