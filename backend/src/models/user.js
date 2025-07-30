// backend/src/models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    setor: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    role: {
      type: DataTypes.ENUM('common', 'TI'),
      defaultValue: 'common'
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: DataTypes.STRING,
    verificationTokenExpires: DataTypes.DATE,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE
  });

  User.associate = models => {
    User.hasMany(models.Ticket, { foreignKey: 'userId' });
  };

  return User;
};
