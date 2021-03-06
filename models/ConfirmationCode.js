module.exports = (sequelize, DataTypes) => {
    const ConfirmationCode = sequelize.define("ConfirmationCode", {
        code: { type: DataTypes.STRING, allowNull: false, unique: true },
    });

    ConfirmationCode.associate = function ({ User }) {
        ConfirmationCode.hasOne(User);
    };

    return ConfirmationCode;
};