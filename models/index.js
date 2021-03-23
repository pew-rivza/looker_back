const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('rivzakat_looker', 'rivzakat_looker', 'XmI0B&0A', {
    host: 'rivzakat.beget.tech',
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