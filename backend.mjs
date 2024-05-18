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
let recipes = null
let riddles = {}

app.get("/items", (req, res) => {
    if(items == null){
        items = JSON.parse(fs.readFileSync("./items.json", 'utf8'))
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

    socket.on("checkTip", (data) => {
        if(!riddles[socket.id]["tippedItems"].includes(data.craftedItem)){
            riddles[socket.id]["tips"]++;
            riddles[socket.id]["tippedItems"].push(data.craftedItem)
            if(riddles[socket.id].riddle.shapeless){
                socket.emit("checkTip" ,checkShapelessRecipe(riddles[socket.id].riddle, data))
            }else{
                socket.emit("checkTip" ,createPossibleCombinations(riddles[socket.id].riddle, data))
            }
        };
    });
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

function createPossibleCombinations(riddle, data){
    let matrices = generateMatrices(riddle.recipe);
    let tip = restoreMatrix(data.originalRecipe);
    let result = compareMatrices(matrices, tip);
    return markMatches(result, tip, riddle);
}

function markMatches(result, tip, riddle){
    let materials = gatherCorrectItems(riddle);
    let matches = [];
    for (let i = 0; i < result.matchingMatrix.length; i++) {
        for (let j = 0; j < result.matchingMatrix[i].length; j++) {
            let obj = {};
            if (tip[i][j] != null) {
                let key = tip[i][j];
                if ((Array.isArray(result.matchingMatrix[i][j]) && result.matchingMatrix[i][j].includes(key)) || result.matchingMatrix[i][j] == key) {
                    obj[key] = "correct";
                    materials.pop(key)
                    console.log(materials)
                } else {
                    obj[key] = "waiting";
                }
            } else {
                obj = { null: null };
            }
            matches.push(obj);
        }
    }
    matches.forEach(match => {
        let key = Object.keys(match)[0];
        if (match[key] == "waiting") { 
            if (materials.includes(key)) { 
                match[key] = "semi-correct";
            } else {
                match[key] = "wrong";
            }
        }
    });
    return matches;
};

function compareMatrices(matrices, tip){
    let mostMatches = -1;
    let matchingMatrix = [];
    matrices.forEach(mat =>{
        let matches = 0;
        for(let i = 0; i < mat.length; i ++){
            for(let j = 0; j < mat[i].length; j++){
                if(mat[i][j] != null){
                    if(Array.isArray(mat[i][j]) && mat[i][j].includes(tip[i][j])){
                        matches++;
                    } else if(mat[i][j] == tip[i][j]){
                        matches++;
                    };
                };
            };
        };
        if(matches > mostMatches){
            mostMatches = matches;
            matchingMatrix = mat;
        };
    });
    return {matches: mostMatches, matchingMatrix: matchingMatrix};
};

function restoreMatrix(data){
    let matrix = [];
    for(let i = 0; i < data.length; i += 3){
        matrix.push([data[i], data[i+1], data[i+2]]);
    }
    return matrix;
}

function generateMatrices(inputMatrix) {
    let results = [];
    let maxRows = 3 - inputMatrix.length + 1;
    let maxCols = 3 - Math.max(...inputMatrix.map(row => row.length)) + 1;
    for (let i = 0; i < maxRows; i++) {
      for (let j = 0; j < maxCols; j++) {
        results.push(fillMatrix(inputMatrix, i, j));
      }
    }
    return results;
}

function fillMatrix(matrix, startRow, startCol) {
    let filledMatrix = Array(3).fill(null).map(() => Array(3).fill(null));
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        filledMatrix[startRow + i][startCol + j] = matrix[i][j] || null;
      }
    }
    return filledMatrix;
}

function checkShapelessRecipe(riddle, data){
    let result = [];
    let correctMaterials = gatherCorrectItems(riddle)
    console.log("original", data.originalRecipe)
    data.originalRecipe.forEach(item => {
        let obj = {};
            let key = item;
            if(item == null){
                obj[key] = null
            } else if(correctMaterials.includes(item)){
                obj[key] = "correct";
            } else{
                obj[key] = "wrong";
            }
            result.push(obj);
    });
    return result;
}

function gatherCorrectItems(riddle){
    let items = [];
    riddle.recipe.forEach(row => {
        row.forEach(cell => {
            if(Array.isArray(cell)){
                cell.forEach(item => {
                    if(item != null){
                        items.push(item);
                    };
                });
            }else{
                items.push(cell);
            };
        });
    });
    return items;
};

function convertRecipes(){
    recipes = JSON.parse(fs.readFileSync("./recipes.json", 'utf8')).data;
    recipes.forEach(recipe => {
        recipe = convertRiddle(recipe)
    });
}

async function createRiddle(socket){
    if(recipes == null){
        convertRecipes()
    }
    let riddle
    do {
        riddle = recipes[Math.floor(Math.random() * recipes.length)];
    } while (!validateRiddle(riddle));
    riddles[socket.id] = {}
    riddles[socket.id]["riddle"] = riddle
    riddles[socket.id]["tips"] = 0
    riddles[socket.id]["tippedItems"] = []
    riddles[socket.id]["hints"] = generateHints(riddle)
    console.log(riddles[socket.id].riddle)
}

function generateHints(riddle){
    let hints = {}
    hints["hint1"] = `Stack size: ${getStackSize(riddle.item)}\nQuantity: ${riddle.quantity}`
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

function getStackSize(item_name){
    if(items == null){
        items = JSON.parse(fs.readFileSync("./items.json", 'utf8'))
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