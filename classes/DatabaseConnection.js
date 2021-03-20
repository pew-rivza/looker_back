const { Sequelize, DataTypes } = require('sequelize');

class DatabaseConnection {
    static instance;
    database;
    static types = DataTypes;

    constructor() {
        this.database = new Sequelize('rivzakat_looker', 'rivzakat_looker', 'XmI0B&0A', {
            host: 'rivzakat.beget.tech',
            dialect: 'mysql'
        });
    }

    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }

        return DatabaseConnection.instance;
    }

    getDatabase() {
        return this.database;
    }
}

module.exports = DatabaseConnection;