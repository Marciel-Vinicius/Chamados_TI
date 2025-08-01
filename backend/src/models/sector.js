// backend/src/models/sector.js
module.exports = (sequelize, DataTypes) => {
    const Sector = sequelize.define('Sector', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: { type: DataTypes.STRING, allowNull: false, unique: true }
    });

    Sector.associate = models => {
        if (models.User) {
            Sector.hasMany(models.User, { foreignKey: 'sectorId' });
        }
    };

    return Sector;
};
