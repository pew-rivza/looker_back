const { Sequelize } = require('sequelize');
const config = require("config");

const dbConfig = config.get("db");

const sequelize = new Sequelize(dbConfig.dbName, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'mysql'
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./User")(sequelize, Sequelize);
db.Clothes = require("./Clothes")(sequelize, Sequelize);

db.User.hasMany(db.Clothes);
db.Clothes.belongsTo(db.User);

module.exports = db;