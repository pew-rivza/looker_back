const ValidationError = require("./ValidationError");

function errorHandler (error, res) {
    if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message })
    }

    res.status(500).json({ message: "Что-то пошло не так, попробуйте снова", error: error.toString() })
}

module.exports = errorHandler;