const ValidationError = require("./ValidationError");
const DatabaseError = require("./DatabaseError");
const HTTPStatuses = require("../constants/HTTPStatuses");

function errorHandler (error, res) {
    if (error instanceof ValidationError) {
        res.status(HTTPStatuses.BAD_REQUEST).json({ message: error.message })
    }

    if (error instanceof DatabaseError) {
        res.status(HTTPStatuses.SERVER_ERROR).json({ message: error.message })
    }

    res.status(HTTPStatuses.SERVER_ERROR).json({ message: "Что-то пошло не так, попробуйте снова", error: error.toString() })
}

module.exports = errorHandler;