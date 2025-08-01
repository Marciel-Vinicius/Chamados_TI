// backend/src/models/reason.js
module.exports = (sequelize, DataTypes) => {
    const Reason = sequelize.define('Reason', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    Reason.associate = models => {
        // futuro: relacionar criação etc.
    };

    return Reason;
};
