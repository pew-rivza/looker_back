class ValidationError extends Error {
    constructor(message) {
        super(`Ошибка валидации: ${message}`);
        this.name = "ValidationError";
    }
}

module.exports = ValidationError;