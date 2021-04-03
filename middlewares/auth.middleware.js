const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = async (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }
    
    try {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({message: "Пользователь не авторизован1"});
        }

        jwt.verify(token, config.get("jwt_secret"), function (err, user) {
            if (err) return res.status(401).json({ message: "Пользователь не авторизован3" });

            req.user = user;
            next();
        });
    } catch (e) {
        res.status(401).json({message: "Пользователь не авторизован2", req});
    }
}