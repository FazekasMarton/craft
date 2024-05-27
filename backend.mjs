import express, { json, response } from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import http from 'http';
import { Server } from 'socket.io';
import admin from "firebase-admin";
import dotenv from "dotenv";

//***************************************DEFINING SERVER *************************************************/

dotenv.config();

let recipesDbServiceAccount, itemsDbServiceAccount;
try {
    recipesDbServiceAccount = JSON.parse(process.env.RecipesKey);
    itemsDbServiceAccount = JSON.parse(process.env.ItemsKey);
} catch (error) {
    console.error("Error parsing service account keys:", error);
    process.exit(1);
}

let recipesDbAdmin, itemsDbAdmin;
try {
    recipesDbAdmin = admin.initializeApp({
        credential: admin.credential.cert(recipesDbServiceAccount),
        databaseURL: "https://craftdle---recipes-f8dd6-default-rtdb.europe-west1.firebasedatabase.app"
    }, "recipes");

    itemsDbAdmin = admin.initializeApp({
        credential: admin.credential.cert(itemsDbServiceAccount),
        databaseURL: "https://craftdle-4ce47-default-rtdb.europe-west1.firebasedatabase.app"
    }, "items");
} catch (error) {
    console.error("Error initializing Firebase admin:", error);
    process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
const port = process.env.PORT || 6969;

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());

app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://craftdle.vercel.app"],
        methods: ["GET", "POST"]
    }
});

let items = null;
let recipes = null;
let riddles = {};

app.get("/items", async (req, res) => {
    try {
        if (items == null) {
            items = await getData(itemsDbAdmin);
        }
        res.send(items);
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/recipes", async (req, res) => {
    try {
        if (recipes == null) {
            await convertRecipes();
        }
        res.send({ data: recipes });
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(500).send("Internal Server Error");
    }
});

io.on('connection', async (socket) => {
    try {
        await createRiddle(socket);

        socket.on("checkTip", (data) => {
            if (!riddles[socket.id]["tippedItems"].includes(data.craftedItem)) {
                riddles[socket.id]["tips"]++;
                riddles[socket.id]["tippedItems"].push(data.craftedItem);
                let result = [];
                if (riddles[socket.id].riddle.shapeless) {
                    result = checkShapelessRecipe(riddles[socket.id].riddle, data);
                } else {
                    result = createPossibleCombinations(riddles[socket.id].riddle, data);
                }
                riddles[socket.id]["tippedRecipes"].push(result.matches);
                socket.emit("checkTip", {
                    result: {
                        tippedRecipes: riddles[socket.id]["tippedRecipes"],
                        tippedItems: riddles[socket.id]["tippedItems"],
                        solved: result.solved
                    },
                    hints: getHints(socket)
                });
            };
        });

        socket.on("newRiddle", () => {
            createRiddle(socket);
        });

        socket.on("disconnect", () => {
            delete riddles[socket.id];
        });
    } catch (error) {
        console.error("Error in socket connection:", error);
    }
});

function getHints(socket) {
    let hints = {
        tips: riddles[socket.id].tips,
        hint1: null,
        hint2: null,
        hint3: null
    };
    let hints_template = riddles[socket.id].hints;
    if (hints.tips >= 5) {
        hints.hint1 = hints_template.hint1;
        if (hints.tips >= 10) {
            hints.hint2 = hints_template.hint2;
            if (hints.tips >= 15) {
                hints.hint3 = hints_template.hint3;
            }
        }
    }
    return hints;
}

function createPossibleCombinations(riddle, data) {
    let matrices = generateMatrices(riddle.recipe);
    let tip = restoreMatrix(data.originalRecipe);
    let result = compareMatrices(matrices, tip);
    return markMatches(result, tip, riddle);
}

function markMatches(result, tip, riddle) {
    let data = gatherCorrectItems(riddle.recipe);
    let materials = data.shapedItems;
    let solved = result.matches === data.essentialItemsNum && result.matches === gatherCorrectItems(tip).essentialItemsNum;
    let matches = [];
    for (let i = 0; i < result.matchingMatrix.length; i++) {
        for (let j = 0; j < result.matchingMatrix[i].length; j++) {
            let obj = {};
            if (tip[i][j] != null) {
                let key = tip[i][j];
                if ((Array.isArray(result.matchingMatrix[i][j]) && result.matchingMatrix[i][j].includes(key)) || result.matchingMatrix[i][j] === key) {
                    obj[key] = "correct";
                    materials = removeFromMaterials(materials, key);
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
        if (match[key] === "waiting") {
            if (materials.includes(key)) {
                match[key] = "semi-correct";
                materials = removeFromMaterials(materials, key);
            } else {
                match[key] = "wrong";
            }
        }
    });
    return { matches: matches, solved: solved };
}

function compareMatrices(matrices, tip) {
    let mostMatches = -1;
    let matchingMatrix = [];
    matrices.forEach(mat => {
        let matches = 0;
        for (let i = 0; i < mat.length; i++) {
            for (let j = 0; j < mat[i].length; j++) {
                if (mat[i][j] != null) {
                    if (Array.isArray(mat[i][j]) && mat[i][j].includes(tip[i][j])) {
                        matches++;
                    } else if (mat[i][j] === tip[i][j]) {
                        matches++;
                    }
                }
            }
        }
        if (matches > mostMatches) {
            mostMatches = matches;
            matchingMatrix = mat;
        }
    });
    return { matches: mostMatches, matchingMatrix: matchingMatrix };
}

function restoreMatrix(data) {
    let matrix = [];
    for (let i = 0; i < data.length; i += 3) {
        matrix.push([data[i], data[i + 1], data[i + 2]]);
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

function removeFromMaterials(data, item) {
    let array = data;
    for (let i = 0; i < array.length; i++) {
        if (Array.isArray(data[i])) {
            if (data[i].includes(item)) {
                array.splice(i, 1);
                break;
            }
        } else if (data[i] === item) {
            array.splice(i, 1);
            break;
        }
    }
    return array;
}

function checkShapelessRecipe(riddle, data) {
    let result = [];
    let matches = 0;
    let mats = gatherCorrectItems(riddle.recipe);
    let wrongMat = false;
    let correctMaterials = mats.shapelessItems;
    data.originalRecipe.forEach(item => {
        let obj = {};
        let key = item;
        if (item == null) {
            obj[key] = null;
        } else if (correctMaterials.includes(item)) {
            obj[key] = "correct";
            matches++;
        } else {
            obj[key] = "wrong";
            wrongMat = true;
        }
        result.push(obj);
    });
    let solved = matches === mats.essentialItemsNum && !wrongMat;
    return { matches: result, solved: solved };
}

function gatherCorrectItems(recipe) {
    let shapelessItems = [];
    let shapedItems = [];
    let essentialItemsNum = 0;
    recipe.forEach(row => {
        row.forEach(cell => {
            if (Array.isArray(cell)) {
                if (!cell.includes(null)) {
                    essentialItemsNum++;
                }
                cell.forEach(item => {
                    if (item != null) {
                        shapelessItems.push(item);
                    }
                });
            } else if (cell != null) {
                shapelessItems.push(cell);
                essentialItemsNum++;
                shapedItems.push(cell);
            }
        });
    });
    return { items: items, essentialItemsNum: essentialItemsNum, shapelessItems: shapelessItems, shapedItems: shapedItems };
}

async function getData(admin) {
    try {
        const db = admin.database();
        const ref = db.ref('/');
        const snapshot = await ref.once('value');
        return snapshot.val();
    } catch (error) {
        console.error("Error getting data from Firebase:", error);
        throw error;
    }
}

async function convertRecipes() {
    try {
        recipes = await getData(recipesDbAdmin);
        recipes = recipes.data;
        recipes.forEach(recipe => {
            recipe = convertRiddle(recipe);
        });
    } catch (error) {
        console.error("Error converting recipes:", error);
        throw error;
    }
}

async function createRiddle(socket) {
    try {
        if (recipes == null) {
            await convertRecipes();
        }
        let riddle;
        do {
            riddle = recipes[Math.floor(Math.random() * recipes.length)];
        } while (!validateRiddle(riddle));
        riddles[socket.id] = {};
        riddles[socket.id]["riddle"] = riddle;
        riddles[socket.id]["tips"] = 0;
        riddles[socket.id]["tippedItems"] = [];
        riddles[socket.id]["hints"] = await generateHints(riddle);
        riddles[socket.id]["tippedRecipes"] = [];
        console.log(riddles);
    } catch (error) {
        console.error("Error creating riddle:", error);
        throw error;
    }
}

async function generateHints(riddle) {
    try {
        let hints = {};
        hints["hint1"] = `Stack size: ${await getStackSize(riddle.item)}\nQuantity: ${riddle.quantity}`;
        hints["hint2"] = `Number of different materials (min): ${findDifferentMaterials(riddle.recipe)}`;
        hints["hint3"] = `Random material: ${randomizeMaterial(riddle.recipe)}`;
        return hints;
    } catch (error) {
        console.error("Error generating hints:", error);
        throw error;
    }
}

function findDifferentMaterials(recipe) {
    let materials = new Set();
    recipe.forEach(row => {
        row.forEach(material => {
            if (!(Array.isArray(material) && material.includes(null) || material == null)) {
                if (Array.isArray(material)) material = material.join(", ");
                materials.add(material);
            }
        });
    });
    return materials.size;
}

function randomizeMaterial(materials) {
    materials = materials.flat(Infinity);
    let material = null;
    while (material == null) {
        material = materials[Math.floor(Math.random() * materials.length)];
    }
    return material;
}

async function getStackSize(item_name) {
    try {
        if (items == null) {
            items = await getData(itemsDbAdmin);
        }
        let stack_size = undefined;
        items.data.forEach(item => {
            if (item.name === item_name) stack_size = item.stackSize;
        });
        return stack_size;
    } catch (error) {
        console.error("Error getting stack size:", error);
        throw error;
    }
}

function convertRiddle(riddle) {
    let craft_matrix = [[], [], []];
    let recipe = [];
    let col = 0;
    let row = 0;

    for (let i = 0; i < 9; i++) {
        let material = riddle.recipe[i];
        recipe.push(material || null);
    }

    recipe.forEach(material => {
        craft_matrix[row].push(material);
        col++;
        if (col === 3) {
            col = 0;
            row++;
        }
    });

    for (let a = 0; a < 2; a++) {
        for (let i = 0; i < craft_matrix.length; i++) {
            let is_all_null = true;
            if (i !== 1 || craft_matrix.length < 3) {
                craft_matrix[i].forEach(material => {
                    if (material != null) is_all_null = false;
                });
                if (is_all_null) {
                    craft_matrix.splice(i, 1);
                    i--;
                }
            }
        }
        for (let i = 0; i < craft_matrix[0].length; i++) {
            let is_all_null = true;
            if (i !== 1 || craft_matrix[0].length < 3) {
                for (let j = 0; j < craft_matrix.length; j++) {
                    if (craft_matrix[j][i] != null) is_all_null = false;
                }
                if (is_all_null) {
                    for (let j = 0; j < craft_matrix.length; j++) {
                        craft_matrix[j].splice(i, 1);
                    }
                    i--;
                }
            }
        }
    }
    riddle.recipe = craft_matrix;
    return riddle;
}

function validateRiddle(riddle) {
    let numberOfMaterials = 0;
    let is_self_craft = false;
    riddle.recipe.forEach(row => {
        row.forEach(material => {
            if (material != null) numberOfMaterials++;
            if (material === riddle.item) is_self_craft = true;
        });
    });
    return numberOfMaterials > 1 && !is_self_craft;
}

server.listen(port, () => {
    console.log("Server is running on port", port);
});
