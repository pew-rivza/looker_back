const {Router} = require("express");
const bcrypt = require("bcryptjs");
const {check, validationResult} = require("express-validator");
const router = Router();
const jwt = require("jsonwebtoken");
const db = require("./../models");
const config = require("config");
const validation = require("../middlewares/validation.middleware");

router.post(
    "/register",
    [
        check("email", "Некорректный e-mail").isEmail(),
        check("password", "Минимальная длина пароля 6 символов")
            .isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if(!errors.isEmpty()) {
                return res.status(400)
                    .json({ errors: errors.array(), message: "Некорректные данные при регистрации" })
            }

            const { email, password } = req.body;

            const candidate = await db.User.findOne({ where: { email } });

            if (candidate) {
                return res.status(400).json({ message: "Такой пользователь уже существует" });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            await db.User.create({ email, password: hashedPassword });

            res.status(201).json({ message: "Пользователь создан", body: req.body, candidate });
        }
        catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте снова", error: e, res })
        }
    });

router.post(
    "/login",
    [
        check("email", "Некорректный e-mail").normalizeEmail().isEmail(),
        check("password", "Пароль является обязательным полем").exists(),
        validation
    ],
    async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await db.User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: "Пользователь с таким e-mail не найден" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Неверный пароль, попробуйте снова" });
            }

            const token = jwt.sign(
                { userId: user.id },
                config.get("jwt_secret"),
                { expiresIn: "8h" }
            )

            res.json({ token, user: user.id })

        }
        catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" })
        }
    });

module.exports = router;