module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Clothes", {
        category: { type: DataTypes.STRING, allowNull: false },
        season: { type: DataTypes.STRING, allowNull: false },
        image: { type: DataTypes.STRING, allowNull: false }
    });
};