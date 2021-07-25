const {Router} = require("express");
const {check} = require("express-validator");
const router = Router();
const db = require("./../models");
const User = db.User;
const validation = require("../middlewares/validation.middleware");
const errorHandler = require("./../errors");
const HTTPStatuses = require("../constants/HTTPStatuses");
const userValidation = require("../validations/User");

router.get(
    "/:email",
    userValidation.userInfo,
    async (req, res) => {
        try {
            const { email } = req.params;
            const user = await User.findByEmail(email);

            return res.status(HTTPStatuses.OK).json({ data: user });
        }
        catch (error) { errorHandler(error, res); }
    });

router.post(
    "/",
    userValidation.registration,
    async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.register(email, password);
            await User.sendCode(user.id);

            return res.status(HTTPStatuses.CREATED).json({ message: "Учетная запись создана", data: user });
        }
        catch (error) { errorHandler(error, res); }
    });

router.patch(
    "/:id",
    userValidation.updating,
    async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.renew(id, req.body);

            return res.status(HTTPStatuses.OK).json({ message: "Данные обновлены", data: user });

        } catch (error) { errorHandler(error, res); }
    });

router.get(
    "/:id/confirmation",
    userValidation.codeSending,
    async (req, res) => {
        try {
            const { id } = req.params;
            await User.sendCode(id);

            res.status(HTTPStatuses.OK).json({ message: "Код подтверждения выслан" });

        } catch (error) { errorHandler(error, res); }
    });

router.post(
    "/:id/confirmation",
    userValidation.codeConfirmation,
    async (req, res) => {
        try {
            const { code } = req.body;
            const { id } = req.params;
            await User.confirm(id, code);

            return res.status(HTTPStatuses.ACCEPTED).json({ message: "Учетная запись подтверждена" });

        } catch (error) { errorHandler(error, res); }
    });

router.post(
    "/token",
    userValidation.authorization,
    async (req, res) => {
        try {
            const { email, password } = req.body;
            let user = await User.authenticate(email, password);
            const data = await User.authorize(user.id);

            return res.status(HTTPStatuses.OK).json({ message: "Токен авторизации выдан", data })
        }
        catch (error) { errorHandler(error, res); }
    });

module.exports = router;