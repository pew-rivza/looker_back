const {Router} = require("express");
const router = Router();
const path = require('path')
const shortid = require('shortid');
const auth = require("../middlewares/auth.middleware");
const {check} = require("express-validator");
const {validationResult} = require("express-validator");
const db = require("./../models");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
        cb(null, shortid.generate() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage });

router.post("/create",
    [
        auth,
        upload.single('clothesImage'),
        check("category", "Категория должна быть заполнена").notEmpty(),
        check("season", "Сезон должен быть заполнен").notEmpty()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if(!errors.isEmpty()) {
                return res.status(400)
                    .json({ errors: errors.array(), message: "Не все поля заполнены" })
            }

            const { category, season } = req.body;
            const image = "\\" + req.file.path;
            const clothes = await db.Clothes.create({ category, season, image });
            const user = await db.User.findByPk(req.user.userId);

            user.addClothes(clothes);


            res.status(201).json({ message: "Вещь создана", body: req.body, file: req.file, user: req.user, clothes });
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