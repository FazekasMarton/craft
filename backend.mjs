import express, { json, response } from "express";
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
let recipies = null
let riddles = {}

app.get("/items", (req, res) => {
    if(items == null){
        items = JSON.parse(fs.readFileSync("./items.json", 'utf8'))
    }
    res.send(items)
})

io.on('connection', async(socket) => {
    await createRiddle(socket)

    socket.on("disconnect", () => {
        delete riddles[socket.id]
    })
});

async function createRiddle(socket){
    if(recipies == null){
        recipies = JSON.parse(fs.readFileSync("./recipes.json", 'utf8')).data;
    }
    let riddle
    do {
        riddle = recipies[Math.floor(Math.random() * recipies.length)];
    } while (!validateRiddle(riddle));
    riddles[socket.id] = convertRiddle(riddle)
    console.log(riddles[socket.id])
}

function convertRiddle(riddle){
    let craft_matrix = [[],[],[]]
    let col = 0
    let row = 0
    riddle.recipe.forEach(material => {
        craft_matrix[row].push(material)
        col++
        if(col == 3){
            col = 0
            row++
        }
    });
    for (let i = 0; i < craft_matrix.length; i++) {
        let is_all_null = true
        craft_matrix[i].forEach(material => {
            if(material != null) is_all_null &= false
        });
        if(is_all_null){
            craft_matrix.splice(i, 1)
            i--
        }
    }
    for (let i = 0; i < craft_matrix[0].length; i++) {
        let is_all_null = true
        for (let j = 0; j < craft_matrix.length; j++) {
            if(craft_matrix[j][i] != null) is_all_null &= false
        }
        if(is_all_null){
            for (let j = 0; j < craft_matrix.length; j++) {
                craft_matrix[j].splice(i, 1)
            }
            i--
        }
    }
    riddle.recipe = craft_matrix
    return riddle
}

function validateRiddle(riddle){
    let numberOfNulls = 0
    let is_self_craft = false
    riddle.recipe.forEach(material => {
        if(material == null) numberOfNulls++
        if(material == riddle.item) is_self_craft |= true
    });
    return numberOfNulls < 8 && !is_self_craft
}

server.listen(port, () => {
    console.log("Server is running on port", port);
});