const jwt = require("jsonwebtoken");
const config = require("config");
const HTTPStatuses = require("../constants/HTTPStatuses");

module.exports = async (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }
    
    try {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(HTTPStatuses.UNAUTHORIZED).json({message: "Пользователь не авторизован1"});
        }

        jwt.verify(token, config.get("jwt_secret"), function (err, user) {
            if (err) return res.status(HTTPStatuses.UNAUTHORIZED).json({ message: "Пользователь не авторизован3" });

            req.user = user;
            next();
        });
    } catch (e) {
        res.status(HTTPStatuses.UNAUTHORIZED).json({message: "Пользователь не авторизован2", req});
    }
}