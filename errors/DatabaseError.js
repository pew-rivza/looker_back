class DatabaseError extends Error {
    constructor(message) {
        super(`Ошибка базы данных: ${message}`);
        this.name = "DatabaseError";
    }
}

module.exports = DatabaseError;