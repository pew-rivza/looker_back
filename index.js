const express = require("express");
const DBConn = require("./classes/DatabaseConnection");
const database = DBConn.getInstance().getDatabase();
const http = require("http");
const WebSocket = require( "ws");

const app = express();
// const server = http.createServer(app);
// const webSocketServer = new WebSocket.Server({ server, path: "/ws" });

app.use(express.json({ extended: true }));

app.use("/api/auth", require("./routes/auth.routes"));

const PORT = 5000

// webSocketServer.on('connection', ws => {
//     ws.on('message', m => {
//         webSocketServer.clients.forEach(client => client.send(m));
//     });
//
//     ws.on("error", e => ws.send(e));
//
//     ws.send('Hi there, I am a WebSocket server');
// });


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




