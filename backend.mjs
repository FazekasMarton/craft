import express, { json, response } from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from "body-parser"
import http from 'http';
import { Server } from 'socket.io';

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
let recipes = null
let riddles = {}

app.get("/items", async(req, res) => {
    if(items == null){
        items = await getData("https://craftdle-4ce47-default-rtdb.europe-west1.firebasedatabase.app/.json")
    }
    res.send(items)
})

app.get("/recipes", (req, res) => {
    if(recipes == null){
        convertRecipes()
    }
    res.send({data: recipes})
})

io.on('connection', async(socket) => {
    await createRiddle(socket)

    socket.on("getHints", () => {
        let hints = {
            tips: riddles[socket.id].tips,
            hint1: null,
            hint2: null,
            hint3: null
        }
        let hints_template = riddles[socket.id].hints
        if(hints.tips >= 5){
            hints.hint1 = hints_template.hint1
            if(hints.tips >= 10){
                hints.hint2 = hints_template.hint2
                if(hints.tips >= 15){
                    hints.hint3 = hints_template.hint3
                }
            }
        }
        socket.emit("hints", hints)
    })

    socket.on("disconnect", () => {
        delete riddles[socket.id]
    })
});

async function getData(url){
    let return_data = {}
    await fetch(url)
    .then(response => response.json())
    .then(data => return_data = data)
    return return_data
}

async function convertRecipes(){
    recipes = await getData("https://craftdle---recipes-f8dd6-default-rtdb.europe-west1.firebasedatabase.app/.json");
    recipes = recipes.data
    recipes.forEach(recipe => {
        recipe = convertRiddle(recipe)
    });
}

async function createRiddle(socket){
    if(recipes == null){
        await convertRecipes()
    }
    let riddle
    do {
        riddle = recipes[Math.floor(Math.random() * recipes.length)];
    } while (!validateRiddle(riddle));
    riddles[socket.id] = {}
    riddles[socket.id]["riddle"] = riddle
    riddles[socket.id]["tips"] = 99
    riddles[socket.id]["hints"] = await generateHints(riddle)
    console.log(riddles[socket.id].riddle)
}

async function generateHints(riddle){
    let hints = {}
    hints["hint1"] = `Stack size: ${await getStackSize(riddle.item)}\nQuantity: ${riddle.quantity}`
    hints["hint2"] = `Number of different materials (min): ${findDifferentMaterials(riddle.recipe)}`
    hints["hint3"] = `Random material: ${randomizeMaterial(riddle.recipe)}`
    return hints
}

function findDifferentMaterials(recipe){
    let materials = new Set()
    recipe.forEach(row => {
        row.forEach(material => {
            if(!(Array.isArray(material) && material.includes(null) || material == null)){
                if(Array.isArray(material)) material = material.join(", ")
                materials.add(material)
            }
        });
    });
    return materials.size
}

function randomizeMaterial(materials){
    materials = materials.flat(Infinity)
    let material = null
    while(material == null){
        material = materials[Math.floor(Math.random() * materials.length)]
    }
    return material
}

async function getStackSize(item_name){
    if(items == null){
        items = await getData("https://craftdle-4ce47-default-rtdb.europe-west1.firebasedatabase.app/.json")
    }
    let stack_size = undefined
    items.data.forEach(item => {
        if(item.name == item_name) stack_size = item.stackSize
    });
    return stack_size
}

function convertRiddle(riddle){
    let craft_matrix = [[],[],[]]
    let col = 0
    let row = 0
    if(!Array.isArray(riddle.recipe)){
        let recipe = []
        for (let i = 0; i < 9; i++) {
            if(riddle.recipe[i] == undefined){
                recipe.push(null)
            }else{
                recipe.push(riddle.recipe[i])
            }
        }
        riddle.recipe = recipe
    }
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
    let numberOfMaterials = 0
    let is_self_craft = false
    riddle.recipe.forEach(row => {
        row.forEach(material => {
            if(material != null) numberOfMaterials++
            if(material == riddle.item) is_self_craft |= true
        });
    });
    return numberOfMaterials > 1 && !is_self_craft
}

server.listen(port, () => {
    console.log("Server is running on port", port);
});