const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false }
    });

    User.associate = function ({ Clothes }) {
        User.hasMany(Clothes)
    };


    User.authenticate = async function (email, password) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error("Пользователя с таким e-mail не существует");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Неверный пароль")
        }

        return user
    }

    User.prototype.authorize = async function() {
        const user = this;

        const token = jwt.sign(
            { userId: user.id },
            config.get("jwt_secret"),
            { expiresIn: "8h" }
        )

        return {user: user.id, token}
    }

    return User;
};