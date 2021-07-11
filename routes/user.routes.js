const {Router} = require("express");
const {check} = require("express-validator");
const router = Router();
const db = require("./../models");
const User = db.User;
const validation = require("../middlewares/validation.middleware");
const errorHandler = require("./../errors");
const HTTPStatuses = require("../constants/HTTPStatuses");
const userValidation = require("../validations/User");

router.post(
    "/",
    userValidation.registration,
    async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.register(email, password);
            await user.sendCode();

            res.status(HTTPStatuses.CREATED).json({ message: "Пользователь создан", data: user });
        }
        catch (error) { errorHandler(error, res); }
    });

router.patch(
    "/",
    [
        check("email", "E-mail является обязательным полем").notEmpty(),
        check("email", "Некорректный e-mail").isEmail(),
        check("code", "Код подтверждения является обязательным полем"),
        validation
    ],
    async (req, res) => {
        try {
            const { code, email } = req.body;
            await User.confirm(email, code);

            res.status(HTTPStatuses.ACCEPTED).json({ message: "E-mail подтвержден" });

        } catch (error) { errorHandler(error, res); }
    });

router.post(
    "/resend",
    [
        check("email", "E-mail является обязательным полем").notEmpty(),
        check("email", "Некорректный e-mail").isEmail(),
        validation
    ],
    async (req, res) => {
        try {
            const { email } = req.body;
            let user = await User.findActiveUser(email);
            await user.sendCode();

            res.status(HTTPStatuses.OK).json({ message: "Код подтверждения выслан повторно" });

        } catch (error) { errorHandler(error, res); }
    });

router.post(
    "/forget",
    [
        check("email", "E-mail является обязательным полем").notEmpty(),
        check("email", "Некорректный e-mail").isEmail(),
        validation
    ],
    async (req, res) => {
        try {
            const { email } = req.body;
            let user = await User.findActiveUser(email);
            await user.sendCode();

            res.status(HTTPStatuses.OK).json({ message: "Код подтверждения выслан" });
        }
        catch (error) { errorHandler(error, res); }
    });

router.post(
    "/password",
    [
        check("email", "E-mail является обязательным полем").notEmpty(),
        check("email", "Некорректный e-mail").isEmail(),
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
            let user = await User.findActiveUser(email);
            user.setPassword(password);

            res.status(HTTPStatuses.OK).json({ message: "Пароль успешно изменен" });
        }
        catch (error) { errorHandler(error, res); }
    });

router.post(
    "/login",
    [
        check("email", "E-mail является обязательным полем").notEmpty(),
        check("email", "Некорректный e-mail").isEmail(),
        check("password", "Пароль является обязательным полем").notEmpty(),
        validation
    ],
    async (req, res) => {
        try {
            const { email, password } = req.body;
            let user = await User.authenticate(email, password);
            user = await user.authorize();
            res.status(HTTPStatuses.OK).json(user)
        }
        catch (error) { errorHandler(error, res); }
    });

module.exports = router;