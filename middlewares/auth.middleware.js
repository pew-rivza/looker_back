const jwt = require("jsonwebtoken");
const JWT_SECRET = "RIVZA";

module.exports = async (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }
    
    try {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({message: "Пользователь не авторизован1"});
        }

        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) {
        res.status(401).json({message: "Пользователь не авторизован2", req});
    }
}