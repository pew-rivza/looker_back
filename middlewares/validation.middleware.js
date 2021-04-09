const {validationResult} = require("express-validator");

module.exports = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400)
                .json({ error: errors.array(), message: "Форма заполнена неверно" })
        }

        next();
    } catch (error) {
        res.status(500).json({error: error, message: "При валидации формы что-то пошло не так"});
    }
}