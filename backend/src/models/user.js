module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('common', 'TI'), defaultValue: 'common' },
    emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verificationToken: { type: DataTypes.STRING },
    verificationTokenExpires: { type: DataTypes.DATE },
    resetPasswordToken: { type: DataTypes.STRING },
    resetPasswordExpires: { type: DataTypes.DATE }
  });
};
