// backend/src/models/ticket.js
module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('Baixa', 'Média', 'Alta'),
      defaultValue: 'Média'
    },
    status: {
      type: DataTypes.ENUM('Aberto', 'Em Andamento', 'Fechado'),
      defaultValue: 'Aberto'
    },
    attachment: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Ticket.associate = models => {
    Ticket.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Ticket;
};
