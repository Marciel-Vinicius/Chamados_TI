// backend/src/models/index.js
const { Sequelize, DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const User = require('./user')(sequelize, DataTypes);
const Ticket = require('./ticket')(sequelize, DataTypes);
const Comment = require('./comment')(sequelize, DataTypes);

let Reason, Category, Priority;
try {
    Reason = require('./reason')(sequelize, DataTypes);
} catch (e) {
    Reason = null;
}
try {
    Category = require('./category')(sequelize, DataTypes);
} catch (e) {
    Category = null;
}
try {
    Priority = require('./priority')(sequelize, DataTypes);
} catch (e) {
    Priority = null;
}

// Associações
User.hasMany(Ticket, { foreignKey: 'userId' });
Ticket.belongsTo(User, { foreignKey: 'userId' });

Ticket.hasMany(Comment, { foreignKey: 'ticketId' });
Comment.belongsTo(Ticket, { foreignKey: 'ticketId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

if (Reason) {
    Ticket.belongsTo(Reason, { foreignKey: 'reasonId' });
}

if (Category) {
    Ticket.belongsTo(Category, { foreignKey: 'categoryId' });
    Category.hasMany(Ticket, { foreignKey: 'categoryId' });
}

if (Priority) {
    Ticket.belongsTo(Priority, { foreignKey: 'priorityId' });
    Priority.hasMany(Ticket, { foreignKey: 'priorityId' });
}

module.exports = {
    sequelize,
    User,
    Ticket,
    Comment,
    Reason,
    Category,
    Priority,
    Op
};
