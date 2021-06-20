const {validationResult} = require("express-validator");
const HTTPStatuses = require("../constants/HTTPStatuses");

module.exports = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(HTTPStatuses.BAD_REQUEST)
                .json({ error: errors.array(), message: "Форма заполнена неверно" })
        }

        next();
    } catch (error) {
        res.status(HTTPStatuses.SERVER_ERROR).json({error: error, message: "При валидации формы что-то пошло не так"});
    }
}