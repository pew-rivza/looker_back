const express = require("express");
const DBConn = require("./classes/DatabaseConnection");
const database = DBConn.getInstance().getDatabase();

const app = express();

app.use(express.json({ extended: true }));

app.use("/api/auth", require("./routes/auth.routes"));

const PORT = 5000

async function start() {
    try {
        await database.authenticate();
        console.log("DB connection is successful");
        app.listen(PORT, () => console.log(`App has been started on ${PORT} port...`));

    } catch (error) {
        console.log("Unable to connect to the DB: ", error)
    }
}

start();




