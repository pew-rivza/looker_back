const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const ValidationError = require("./../errors/ValidationError");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    });

    User.associate = function ({ Clothes }) {
        User.hasMany(Clothes)
    };

    User.authenticate = async function (email, password) {
        const user = await User.findOne({ where: { email, active: true } });
        if (!user) {
            throw new ValidationError("Неверный логин или пароль");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new ValidationError("Неверный логин или пароль");
        }

        return user
    };

    User.prototype.authorize = async function() {
        const user = this;

        const token = jwt.sign(
            { userId: user.id },
            config.get("jwt_secret"),
            { expiresIn: "8h" }
        )

        return {user: user.id, token}
    };

    User.existenceChecking = async function(email) {
        const candidate = await User.findOne({ where: { email } });

        if (candidate) {
            throw new ValidationError("Пользователь с таким e-mail уже зарегистрирован");
        }
    };

    User.register = async function(email, password) {
        const hashedPassword = await bcrypt.hash(password, 12);

        return await User.create({ email, password: hashedPassword });
    }

    return User;
};