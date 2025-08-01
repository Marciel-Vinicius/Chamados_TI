// backend/src/models/priority.js
module.exports = (sequelize, DataTypes) => {
    const Priority = sequelize.define('Priority', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: { type: DataTypes.STRING, allowNull: false, unique: true }
    });

    Priority.associate = models => {
        if (models.Ticket) {
            Priority.hasMany(models.Ticket, { foreignKey: 'priorityId' });
        }
    };

    return Priority;
};
