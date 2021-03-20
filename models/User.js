const DBConn = require("../classes/DatabaseConnection");
const database = DBConn.getInstance().getDatabase();
const types = DBConn.types;

const User = database.define("User", {
    email: { type: types.STRING, allowNull: false, unique: true },
    password: { type: types.STRING, allowNull: false }
});

database.sync().then(() => {
    console.log("Users synchronized");
});

module.exports = User;