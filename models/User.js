module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false }
    });

    User.associate = function ({ Clothes }) {
        User.hasMany(Clothes)
    };

    return User;
};