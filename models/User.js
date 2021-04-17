const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const ValidationError = require("./../errors/ValidationError");
const DatabaseError = require("./../errors/DatabaseError");
const shortid = require('shortid');
const nodemailer = require("nodemailer");
const ConfirmationCodeModel = require("./ConfirmationCode");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    });

    const ConfirmationCode = ConfirmationCodeModel(sequelize, DataTypes);

    User.associate = function ({ Clothes, ConfirmationCode }) {
        User.hasMany(Clothes);
        User.belongsTo(ConfirmationCode)
    };

    User.findActiveUser = async function(email) {
        const user = await User.findOne({ where: { email, active: true } });
        if (!user) {
            throw new ValidationError("Пользователь с таким e-mail не найден");
        }

        return user;
    }

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

        return { user: user.id, token }
    };

    User.existenceChecking = async function(email) {
        const candidate = await User.findOne({ where: { email } });

        if (candidate) {
            throw new ValidationError("Пользователь с таким e-mail уже зарегистрирован");
        }
    };

    User.register = async function(email, password) {
        await User.existenceChecking(email);
        const hashedPassword = await bcrypt.hash(password, 12);

        return await User.create({ email, password: hashedPassword });
    }

    User.prototype.sendCode = async function() {
        const user = this;

        const existedCode = await user.getConfirmationCode();
        const code = existedCode ? existedCode.code : shortid.generate();

        if (!existedCode) {
            await user.createConfirmationCode({ code });
        }

        user.sendMail("Подтверждение e-mail для LKR-APP.COM", `Ваш код подтверждения: ${code}`);
    };

    User.prototype.sendMail = function (subject, text) {
        const user = this;
        const smtp = config.get("smtp");
        const transporter = nodemailer
            .createTransport(smtp.transporter, smtp.defaults);

        transporter.sendMail({
            to: user.email,
            subject,
            text
        }, (err) => {
            if (err) {
                console.log(err);
                throw new Error("Не удалось отправить письмо")
            }
        });
    };

    User.authenticateByConfirmationCode = async function (email, userCode) {
        let user = await User.findOne({ where: { email }, include: "ConfirmationCode" });
        if (!(user && user.ConfirmationCode)) {
            throw new DatabaseError("Данные о пользователе с таким e-mail не найдены");
        }

        const code = user.ConfirmationCode.code;
        if (userCode !== code) {
            throw new ValidationError("Неверный код подтверждения");
        }

        return user;
    };

    User.confirm = async function(email, userCode) {
        const user = await User.authenticateByConfirmationCode(email, userCode);
        const code = user.ConfirmationCode;

        await User.update({ active: true }, { where: { email } });
        ConfirmationCode.destroy({ where: { id: code.id } });

        return user;
    };

    User.prototype.setPassword = async function(password) {
        const user = this;
        const hashedPassword = await bcrypt.hash(password, 12);

        await User.update({ password: hashedPassword }, { where: { id: user.id } });
    };

    return User;
};