const {Router} = require("express");
const bcrypt = require("bcryptjs");
const {check, validationResult} = require("express-validator");
const router = Router();
const db = require("./../models");
const User = db.User;
const validation = require("../middlewares/validation.middleware");
const ValidationError = require("./../errors/ValidationError");

router.post(
    "/register",
    [
        check("email", "E-mail является обязательным полем").notEmpty(),
        check("email", "Некорректный e-mail").normalizeEmail().isEmail(),
        check("password", "Пароль является обязательным полем").notEmpty(),
        check("password", "Пароль должен содержать минимум 6 символов, один заглавный " +
            "символ, один строчный символ, одну цифру и один специальный символ (@, $, !, %, *, #, ?, &)")
            .custom(password => {
                return (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/).test(password)
            }),
        check("passwordConfirmation", "Подтверждение пароля является обязательным полем").notEmpty(),
        check("passwordConfirmation", "Пароли должны совпадать")
            .custom((passwordConfirmation, {req}) => {
                return passwordConfirmation === req.body.password
            }),
        validation
    ],
    async (req, res) => {
        try {
            const { email, password } = req.body;
            await User.existenceChecking(email);
            await User.register(email, password);

            res.status(201).json({ message: "Пользователь создан" });
        }
        catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте снова", error: e, res })
        }
    });

router.post(
    "/confirm",
    [
        check("code", ""),
        validation
    ],
    async (req, res) => {
        try {

        } catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).json({ message: error.message })
            }

            res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" })
        }
    })

router.post(
    "/login",
    [
        check("email", "E-mail является обязательным полем").notEmpty(),
        check("email", "Некорректный e-mail").normalizeEmail().isEmail(),
        check("password", "Пароль является обязательным полем").notEmpty(),
        validation
    ],
    async (req, res) => {
        try {
            const { email, password } = req.body;
            let user = await User.authenticate(email, password);
            user = await user.authorize()
            res.json(user)
        }
        catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).json({ message: error.message })
            }

            res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" })
        }
    });

module.exports = router;