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

    User.findById = async function(id) {
        const user = await User.findOne({ where: { id } });
        if (!user) {
            throw new ValidationError("Пользователь не найден");
        }

        return user;
    }

    User.findByEmail = async function(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new ValidationError("Пользователь не найден");
        }

        return user;
    }

    User.findActive = async function(id) {
        const user = await User.findOne({ where: { id, active: true } });
        if (!user) {
            throw new ValidationError("Пользователь не найден");
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

    User.authorize = async function(id) {
        const user = await User.findById(id);

        const token = jwt.sign(
            { userId: user.id },
            config.get("jwt_secret"),
            { expiresIn: "8h" }
        )

        return { userId: user.id, token }
    };

    User.isExist = async function(email) {
        const candidate = await User.findOne({ where: { email } });
        return !!candidate
    };

    User.register = async function(email, password) {
        if (await User.isExist(email)) {
            throw new ValidationError("Пользователь уже зарегистрирован");
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        return await User.create({ email, password: hashedPassword });
    }

    User.sendCode = async function(id) {
        const user = await User.findById(id);

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

    User.validateConfirmationCode = async function (id, userCode) {
        let user = await User.findOne({ where: { id }, include: "ConfirmationCode" });
        if (!(user && user.ConfirmationCode)) {
            throw new DatabaseError("Пользователь не найден");
        }

        const code = user.ConfirmationCode.code;
        if (userCode !== code) {
            throw new ValidationError("Неверный код подтверждения");
        }

        return user.ConfirmationCode;
    };

    User.confirm = async function(id, userCode) {
        const code = await User.validateConfirmationCode(id, userCode);

        await User.update({ active: true }, { where: { id } });
        ConfirmationCode.destroy({ where: { id: code.id } });
    };

    User.renew = async function(id, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 12);
        }

        const user = User.findActive(id)
        if (user) await User.update(data, { where: { id } });

        return await user;
    };

    return User;
};