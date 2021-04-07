module.exports = (sequelize, DataTypes) => {
    const Clothes = sequelize.define("Clothes", {
        category: { type: DataTypes.STRING, allowNull: false },
        season: { type: DataTypes.STRING, allowNull: false },
        image: { type: DataTypes.STRING, allowNull: false }
    });

    Clothes.associate = function ({ User }) {
        Clothes.belongsTo(User)
    }

    return Clothes;
};