const {check} = require("express-validator");
const validation = require("../middlewares/validation.middleware");

const registration = [
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
];

module.exports = {
    registration
}