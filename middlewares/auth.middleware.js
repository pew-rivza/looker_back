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

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({message: "Пользователь не авторизован2", req});
    }
}