module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Ticket', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.ENUM('Rede','Impressora','Sistema','Hardware','Outro'), allowNull: false },
    priority: { type: DataTypes.ENUM('Baixa','Média','Alta'), allowNull: false },
    status: { type: DataTypes.ENUM('Aberto','Em andamento','Concluído','Cancelado'), defaultValue: 'Aberto' },
    attachment: { type: DataTypes.STRING }
  });
};
