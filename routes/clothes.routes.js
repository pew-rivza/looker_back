const {Router} = require("express");
const router = Router();
const auth = require("../middlewares/auth.middleware");
const {check} = require("express-validator");
const {validationResult} = require("express-validator");
const db = require("./../models");

router.post("/create",
    [
        auth,
        check("category", "Категория должна быть заполнена").notEmpty(),
        check("season", "Сезон должен быть заполнен").notEmpty(),
        check("image", "Изображение должно быть заполнено").notEmpty(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if(!errors.isEmpty()) {
                return res.status(400)
                    .json({ errors: errors.array(), message: "Не все поля заполнены" })
            }

            const { category, season, image } = req.body;
            const clothes = await db.Clothes.create({ category, season, image });
            const user = await db.User.findByPk(req.user.userId);

            user.addClothes(clothes);


            res.status(201).json({ message: "Вещь создана", body: req.body, headers: req.headers, user: req.user, clothes });
        }
        catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте снова", error: e, res })
        }
    }
);

router.get("/", auth, async (req, res) => {
    try {
        const user = await db.User.findByPk(req.user.userId);
        const clothes = await user.getClothes();
        res.json({clothes, request: req.headers});
    }
    catch (e) {
        res.status(500).json({ message: "Что-то пошло не так, попробуйте снова", error: e, res })
    }
});

router.get("/:id", auth, async (req, res) => {
    try {
        const clothes = await db.Clothes.findByPk(req.params.id);
        res.json(clothes);
    }
    catch (e) {
        res.status(500).json({ message: "Что-то пошло не так, попробуйте снова", error: e, res })
    }
});

module.exports = router;