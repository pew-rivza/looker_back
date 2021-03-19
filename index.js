const express = require("express");
const { Sequelize } = require('sequelize');

const app = express();

app.use("/api/auth", require("./routes/auth.routes"));

const PORT = 5000

async function start() {
    const sequelize = new Sequelize('rivzakat_looker', 'rivzakat_looker', 'XmI0B&0A', {
        host: 'rivzakat.beget.tech',
        dialect: 'mysql'
    });

    try {
        await sequelize.authenticate();
        console.log("DB connection is successful");
        app.listen(PORT, () => console.log(`App has been started on ${PORT} port...`));

    } catch (error) {
        console.log("Unable to connect to the DB: ", error)
    }
}

start();




