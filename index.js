const express = require("express");
const db = require("./models");
const path = require("path");
const config = require("config");

const app = express();

app.use(express.json({ extended: true }));

app.use('/uploads', express.static(__dirname + '/uploads'));

app.use("/api/user", require("./routes/user.routes"));
app.use("/api/clothes", require("./routes/clothes.routes"));

if (process.env.NODE_ENV === "production") {
    app.use("/", express.static(path.join(__dirname, "client", "build")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
    })
}

const PORT = config.get("port") || 5000;


async function start() {
    try {
        await db.sequelize.authenticate();
        await db.sequelize.sync();

        console.log("Database has been connected...");
        app.listen(PORT, "localhost", () => console.log(`Server on ${PORT} port has been started...`));

    } catch (error) {
        console.log("Unable to connect to the DB: ", error)
    }
}

start();




