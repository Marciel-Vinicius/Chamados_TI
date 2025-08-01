// backend/src/models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'common' // ou 'TI'
    },
    setor: { type: DataTypes.STRING, allowNull: true }, // legado / para exibição rápida
    emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verificationToken: { type: DataTypes.STRING, allowNull: true },
    verificationTokenExpires: { type: DataTypes.DATE, allowNull: true },
    resetPasswordToken: { type: DataTypes.STRING, allowNull: true },
    resetPasswordExpires: { type: DataTypes.DATE, allowNull: true },
    sectorId: { type: DataTypes.INTEGER, allowNull: true } // FK novo
  });

  User.associate = models => {
    if (models.Ticket) {
      User.hasMany(models.Ticket, { foreignKey: 'userId' });
    }
    if (models.Comment) {
      User.hasMany(models.Comment, { foreignKey: 'userId' });
    }
    if (models.Sector) {
      User.belongsTo(models.Sector, { foreignKey: 'sectorId' });
    }
  };

  return User;
};
