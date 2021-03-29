const express = require("express");
const db = require("./models");

const app = express();

app.use(express.json({ extended: true }));

app.use('/uploads', express.static(__dirname + '/uploads'));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/clothes", require("./routes/clothes.routes"));

const PORT = 5000


async function start() {
    try {
        await db.sequelize.authenticate();
        await db.sequelize.sync();

        console.log("DB connection is successful");
        app.listen(PORT, () => console.log(`App has been started on ${PORT} port...`));

    } catch (error) {
        console.log("Unable to connect to the DB: ", error)
    }
}

start();




