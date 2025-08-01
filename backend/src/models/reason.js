// backend/src/models/reason.js
module.exports = (sequelize, DataTypes) => {
    const Reason = sequelize.define('Reason', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: { type: DataTypes.STRING, allowNull: false, unique: true }
    });

    Reason.associate = models => {
        if (models.Ticket) {
            Reason.hasMany(models.Ticket, { foreignKey: 'reasonId' });
        }
    };

    return Reason;
};
