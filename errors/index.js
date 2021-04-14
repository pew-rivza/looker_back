const ValidationError = require("./ValidationError");
const DatabaseError = require("./DatabaseError");

function errorHandler (error, res) {
    if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message })
    }

    if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message })
    }

    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова", error: error.toString() })
}

module.exports = errorHandler;