const {Router} = require("express");
const bcrypt = require("bcryptjs");
const {check, validationResult} = require("express-validator");
const User = require("./../models/User");
const router = Router();
const jwt = require("jsonwebtoken");

const JWT_SECRET = "RIVZA";

router.get("/check", async (req, res) => {
    res.status(200).json({ message: "Hello! This is my test backend" });
})

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

            const candidate = await User.findOne({ where: { email } });

            if(candidate) {
                return res.status(400).json({ message: "Такой пользователь уже существует" })
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            await User.create({ email, password: hashedPassword });

            res.status(201).json({ message: "Пользователь создан" });
        }
        catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" })
        }
    });

router.post(
    "/login",
    [
        check("email", "Введите корректный e-mail").normalizeEmail().isEmail(),
        check("password", "Введие пароль").exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if(!errors.isEmpty()) {
                return res.status(400)
                    .json({ errors: errors.array(), message: "Некорректные данные при входе в систему" })
            }

            const { email, password } = req.body;

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: "Пользователь с таким e-mail не найден" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Неверный пароль, попробуйте снова" });
            }

            const token = jwt.sign(
                { userId: user.id },
                JWT_SECRET,
                { expiresIn: "1h" }
            )

            res.json({ token, user: user.id })

        }
        catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте снова" })
        }
    });

module.exports = router;