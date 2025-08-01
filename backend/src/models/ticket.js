// backend/src/models/ticket.js
module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false }, // legacy
    priority: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Média' }, // legacy
    status: {
      type: DataTypes.ENUM('Aberto', 'Em Andamento', 'Fechado'),
      allowNull: false,
      defaultValue: 'Aberto'
    },
    attachment: { type: DataTypes.STRING, allowNull: true },
    viewedByTI: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    reasonId: { type: DataTypes.INTEGER, allowNull: true },
    categoryId: { type: DataTypes.INTEGER, allowNull: true },
    priorityId: { type: DataTypes.INTEGER, allowNull: true }
  });

  Ticket.associate = models => {
    if (models.User) {
      Ticket.belongsTo(models.User, { foreignKey: 'userId' });
    }
    if (models.Reason) {
      Ticket.belongsTo(models.Reason, { foreignKey: 'reasonId' });
    }
    if (models.Category) {
      Ticket.belongsTo(models.Category, { foreignKey: 'categoryId' });
    }
    if (models.Priority) {
      Ticket.belongsTo(models.Priority, { foreignKey: 'priorityId' });
    }
  };

  return Ticket;
};
