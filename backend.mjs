import express, { json } from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from "body-parser"
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';

//***************************************DEFINING SERVER *************************************************/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
const port = process.env.PORT || 6969;

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use(bodyParser.json())

app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
});

let items = null
let riddles = {}

io.on('connection', async(socket) => {
    await createRiddle(socket)

    socket.on("disconnect", () => {
        delete riddles[socket.id]
    })
});

async function createRiddle(socket){
    if(items == null){
        items = JSON.parse(fs.readFileSync("./recipes.json", 'utf8')).data;
    }
    let riddle
    let numberOfNulls = 0
    do {
        riddle = items[Math.floor(Math.random() * items.length)];
        riddles[socket.id] = riddle
        console.log(riddles[socket.id])
        numberOfNulls = 0
        riddles[socket.id].recipe.forEach(material => {
            if(material == null) numberOfNulls++
        });
    } while (numberOfNulls >= 8);
}

server.listen(port, () => {
    console.log("Server is running on port", port);
});