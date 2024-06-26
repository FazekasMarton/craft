import express, { json, response } from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import http from 'http';
import { Server } from 'socket.io';
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const recipesDbServiceAccount = JSON.parse(process.env.RecipesKey);
const itemsDbServiceAccount = JSON.parse(process.env.ItemsKey);
const usersDbServiceAccount = JSON.parse(process.env.UsersKey);
let recipesDbAdmin;
let itemsDbAdmin;
let usersDbAdmin;

try {
    recipesDbAdmin = admin.initializeApp({
        credential: admin.credential.cert(recipesDbServiceAccount),
        databaseURL: "https://craftdle---recipes-f8dd6-default-rtdb.europe-west1.firebasedatabase.app"
    }, "recipes");
} catch (e) {
    console.error('Failed to initialize recipesDbAdmin:', e.message);
    recipesDbAdmin = null;
};

try {
    itemsDbAdmin = admin.initializeApp({
        credential: admin.credential.cert(itemsDbServiceAccount),
        databaseURL: "https://craftdle-4ce47-default-rtdb.europe-west1.firebasedatabase.app"
    }, "items");
} catch (e) {
    console.error('Failed to initialize itemsDbAdmin:', e.message);
    itemsDbAdmin = null;
};

try {
    usersDbAdmin = admin.initializeApp({
        credential: admin.credential.cert(usersDbServiceAccount),
        databaseURL: "https://craftdle---users-default-rtdb.europe-west1.firebasedatabase.app"
    }, "users");
} catch (e) {
    console.error('Failed to initialize itemsDbAdmin:', e.message);
    itemsDbAdmin = null;
};

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

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get("/items", async (req, res) => {
    try {
        if (itemsDbAdmin == null) {
            throw new Error('Firebase not initialized for items database');
        } else if (items == null) {
            items = await getData(itemsDbAdmin);
        }
        res.send(items);
    } catch (e) {
        console.error(e.message);
        res.status(500).send({ error: e.message });
    };
});

app.get("/recipes", async (req, res) => {
    try {
        if (recipesDbAdmin == null) {
            throw new Error('Firebase not initialized for recipes database');
        } else if (recipes == null) {
            await convertRecipes();
        }
        res.send({ data: recipes });
    } catch (e) {
        console.error(e.message);
        res.status(500).send({ error: e.message });
    };
});

app.get('/minecraft-images/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, 'public/minecraft-images', imageName);

    console.log(imagePath);

    res.sendFile(imagePath, (err) => {
        if (err) {
            res.status(404).send('Image not found');
        };
    });
});

io.on('connection', async (socket) => {
    socket.on("checkTip", async (data) => {
        try {
            if (!riddles[socket.id]["tippedItems"].includes(data.craftedItem)) {
                riddles[socket.id]["tips"]++;
                riddles[socket.id]["tippedItems"].push(data.craftedItem);
                let result = [];
                if (riddles[socket.id].riddle.shapeless) {
                    result = checkShapelessRecipe(riddles[socket.id].riddle, data);
                } else {
                    result = createPossibleCombinations(riddles[socket.id].riddle, data);
                };
                riddles[socket.id]["tippedRecipes"].push(result.matches);
                socket.emit("checkTip", {
                    result: {
                        tippedRecipes: riddles[socket.id]["tippedRecipes"],
                        tippedItems: riddles[socket.id]["tippedItems"],
                        solved: result.solved
                    },
                    hints: getHints(socket)
                });
                if (result.solved) {
                    riddles[socket.id].streak += 1;
                    await updateUsersData("solvedRiddles");
                    io.to("admin").emit("users", await getUsersData());
                };
            };
        } catch (e) {
            socket.emit('error', { error: e.message });
        };
    });

    socket.on("newRiddle", async (data) => {
        let mode = data?.mode;
        let exist = riddles[socket.id] == undefined;
        try {
            await createRiddle(socket, mode);
        } catch (e) {
            socket.emit('error', { error: e.message });
        };
        if (exist) {
            await updateUsersData("visitors");
            io.to("admin").emit("users", await getUsersData());
        };
    });

    socket.on("login", async () => {
        socket.join("admin");
        socket.emit("users", await getUsersData());
    });

    socket.on("disconnect", async () => {
        let streak = riddles[socket.id]?.streak;
        if (streak > 0) {
            await addStreak(streak);
        };
        delete riddles[socket.id];
        io.to("admin").emit("users", await getUsersData());
    });
});

async function addStreak(streak) {
    if (port != 6969) {
        const db = usersDbAdmin.database();
        const ref = db.ref(`/streakPerPlayers`);
        await ref.transaction(currentData => {
            if (!Array.isArray(currentData)) {
                return [streak];
            } else {
                currentData.push(streak);
                return currentData;
            };
        });
    };
};

async function updateUsersData(path) {
    if (port != 6969) {
        const db = usersDbAdmin.database();
        const userRef = db.ref(`/date/${getTodayDate()}/`);
        const snapshot = await userRef.once('value');
        const dataRef = userRef.child(path);
        if (!snapshot.exists()) {
            userRef.set({
                "visitors": 0,
                "solvedRiddles": 0
            });
        };
        await dataRef.transaction((currentData) => {
            if (currentData === null) {
                return 1;
            };
            return currentData + 1;
        });
    };
};

async function getUsersData() {
    let data = await getData(usersDbAdmin);
    data["currentPlayers"] = Object.keys(riddles).length;
    data["todayDate"] = getTodayDate();
    return data;
};

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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
            };
        };
    };
    return hints;
};

function createPossibleCombinations(riddle, data) {
    let matrices = generateMatrices(riddle.recipe);
    let tip = restoreMatrix(data.originalRecipe);
    let result = compareMatrices(matrices, tip);
    return markMatches(result, tip, riddle);
};

function markMatches(result, tip, riddle) {
    let data = riddle.materials;
    let materials = data.shapedItems.slice();
    let solved = result.matches === data.essentialItemsNum && result.matches === gatherCorrectItems(tip).essentialItemsNum;
    let matches = [];

    for (let i = 0; i < result.matchingMatrix.length; i++) {
        for (let j = 0; j < result.matchingMatrix[i].length; j++) {
            let obj = {};
            if (tip[i][j] != null) {
                let key = tip[i][j];
                if ((Array.isArray(result.matchingMatrix[i][j]) && result.matchingMatrix[i][j].includes(key)) || result.matchingMatrix[i][j] === key) {
                    obj[key] = "correct";
                    removeFromMaterials(key);
                } else {
                    obj[key] = "waiting";
                };
            } else {
                obj = { null: null };
            };
            matches.push(obj);
        };
    };

    function removeFromMaterials(item) {
        for (let i = 0; i < materials.length; i++) {
            if ((Array.isArray(materials[i]) && materials[i].includes(item)) || materials[i] === item) {
                materials.splice(i, 1);
                break;
            };
        };
    };

    matches.forEach(match => {
        let key = Object.keys(match)[0];
        if (match[key] === "waiting") {
            let foundIndex = materials.findIndex(mat => (Array.isArray(mat) && mat.includes(key)) || mat === key);
            if (foundIndex !== -1) {
                match[key] = "semi-correct";
                materials.splice(foundIndex, 1);
            } else {
                match[key] = "wrong";
            };
        };
    });

    return { matches: matches, solved: solved };
};

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
                    };
                };
            };
        };
        if (matches > mostMatches) {
            mostMatches = matches;
            matchingMatrix = mat;
        };
    });
    return { matches: mostMatches, matchingMatrix: matchingMatrix };
};

function restoreMatrix(data) {
    let matrix = [];
    for (let i = 0; i < data.length; i += 3) {
        matrix.push(data.slice(i, i + 3));
    };
    return matrix;
};

function generateMatrices(recipe) {
    let matrices = [];
    for (let i = 0; i <= 3 - recipe.length; i++) {
        for (let j = 0; j <= 3 - recipe[0].length; j++) {
            let matrix = [[], [], []];
            for (let k = 0; k < i; k++) matrix[k] = [null, null, null];
            for (let k = 0; k < recipe.length; k++) {
                for (let l = 0; l < j; l++) matrix[i + k].push(null);
                for (let l = 0; l < recipe[0].length; l++) {
                    matrix[i + k].push(recipe[k][l]);
                };
                for (let l = 0; l < 3 - j - recipe[0].length; l++) matrix[i + k].push(null);
            };
            for (let k = 0; k < 3 - i - recipe.length; k++) matrix[i + recipe.length + k] = [null, null, null];
            matrices.push(matrix);
        };
    };
    return matrices;
};

function checkShapelessRecipe(riddle, data) {
    let result = [];
    let matches = 0;
    let mats = riddle.materials;
    let wrongMat = false;
    let correctMaterials = mats.shapelessItems.slice();
    data.originalRecipe.forEach(item => {
        let obj = {};
        let key = item;
        if (item == null) {
            obj[key] = null;
        } else if (correctMaterials.includes(item)) {
            obj[key] = "correct";
            matches++;
            let index = correctMaterials.indexOf(item);
            correctMaterials.splice(index, 1);
        } else {
            obj[key] = "wrong";
            wrongMat = true;
        }
        result.push(obj);
    });
    let solved = matches === mats.essentialItemsNum && !wrongMat;
    return { matches: result, solved: solved };
};

function gatherCorrectItems(recipe) {
    let shapelessItems = [];
    let shapedItems = [];
    let essentialItemsNum = 0;
    recipe.forEach(row => {
        row.forEach(cell => {
            if (Array.isArray(cell)) {
                if (!cell.includes(undefined)) {
                    essentialItemsNum++;
                };
                cell.forEach(item => {
                    if (item != undefined) {
                        shapelessItems.push(item);
                    };
                });
                shapedItems.push(cell);
            } else if (cell != undefined) {
                shapelessItems.push(cell);
                essentialItemsNum++;
                shapedItems.push(cell);
            };
        });
    });
    return { essentialItemsNum: essentialItemsNum, shapelessItems: shapelessItems, shapedItems: shapedItems };
};

async function getData(admin) {
    try {
        const db = admin.database();
        const ref = db.ref('/');
        const snapshot = await ref.once('value');
        const data = snapshot.val();
        return data;
    } catch (e) {
        throw new Error('Failed to fetch data from Firebase.');
    };
};

async function convertRecipes() {
    try {
        recipes = await getData(recipesDbAdmin);
        recipes = recipes.data;
        recipes.forEach(recipe => {
            convertRiddle(recipe);
        });
    } catch (e) {
        throw new Error('Failed to convert recipes.');
    };
};

async function createRiddle(socket, mode) {
    try {
        if (recipes == null) {
            await convertRecipes();
        }
        let riddle;
        do {
            riddle = recipes[Math.floor(Math.random() * recipes.length)];
        } while (!validateRiddle(riddle, mode));
        if (riddles[socket.id] == undefined) {
            riddles[socket.id] = {};
        };
        riddles[socket.id]["riddle"] = riddle;
        riddles[socket.id]["riddle"]["materials"] = gatherCorrectItems(riddle.recipe);
        riddles[socket.id]["tips"] = 0;
        riddles[socket.id]["tippedItems"] = [];
        riddles[socket.id]["hints"] = await generateHints(riddle);
        riddles[socket.id]["tippedRecipes"] = [];
        if (riddles[socket.id]["streak"] == undefined) {
            riddles[socket.id]["streak"] = 0;
        };
        console.log(riddles);
    } catch (e) {
        throw new Error('Failed to create a riddle.');
    };
};

async function generateHints(riddle) {
    let hints = {};
    hints["hint1"] = `This recipe only requires (min) ${riddle.materials.essentialItemsNum} of slots`;
    hints["hint2"] = findCommonItem(riddle);
    hints["hint3"] = `Random material: ${randomizeMaterial(riddle.recipe)}`;
    return hints;
};

function findCommonItem(riddle){
    let randomMaterials = shuffleArray(riddle.materials.shapelessItems);
    let resultRecipe;
    outerloop: for(let i = 0; i < randomMaterials.length; i++){
        for (let j = 0; j < recipes.length; j++) {
            const recipe = recipes[j];
            if (!recipe.shapeless && recipe.item != riddle.item) {
                if (gatherCorrectItems(recipe.recipe).shapelessItems.includes(randomMaterials[i])) {
                    resultRecipe = `Material(s) in this recipe are also found in: ${recipe.item}`;
                    break outerloop;
                };
            };
        };
    };
    if(resultRecipe == undefined){
        resultRecipe = "This recipe has unique items!";
    };
    return resultRecipe;
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    };
    return array;
};

function randomizeMaterial(materials) {
    materials = materials.flat(Infinity);
    let material = null;
    while (material == null) {
        material = materials[Math.floor(Math.random() * materials.length)];
    };
    return material;
};

async function getStackSize(item_name) {
    if (items == null) {
        items = await getData(itemsDbAdmin);
    };
    let stack_size = undefined;
    items.data.forEach(item => {
        if (item.name == item_name) stack_size = item.stackSize;
    });
    return stack_size;
};

function convertRiddle(riddle) {
    let craft_matrix = [[], [], []];
    let recipe = [];
    let col = 0;
    let row = 0;

    for (let i = 0; i < 9; i++) {
        let material = riddle.recipe[i];
        if (material == null || material == undefined) {
            recipe.push(null);
        } else {
            recipe.push(material);
        };
    };

    recipe.forEach(material => {
        craft_matrix[row].push(material);
        col++;
        if (col == 3) {
            col = 0;
            row++;
        };
    });
    for (let a = 0; a < 2; a++) {
        for (let i = 0; i < craft_matrix.length; i++) {
            let is_all_null = true;
            if (i != 1 || craft_matrix.length < 3) {
                craft_matrix[i].forEach(material => {
                    if (material != null) is_all_null &= false;
                });
                if (is_all_null) {
                    craft_matrix.splice(i, 1);
                    i--;
                };
            };
        };
        for (let i = 0; i < craft_matrix[0].length; i++) {
            let is_all_null = true;
            if (i != 1 || craft_matrix[0].length < 3) {
                for (let j = 0; j < craft_matrix.length; j++) {
                    if (craft_matrix[j][i] != null) is_all_null &= false;
                };
                if (is_all_null) {
                    for (let j = 0; j < craft_matrix.length; j++) {
                        craft_matrix[j].splice(i, 1);
                    };
                    i--;
                };
            };
        };
    };
    riddle.recipe = craft_matrix;
    return riddle;
};

function validateRiddle(riddle, mode) {
    let numberOfMaterials = 0;
    let materials = new Set();
    let is_self_craft = false;
    riddle.recipe.forEach(row => {
        row.forEach(material => {
            if (material != null) {
                numberOfMaterials++;
                if (Array.isArray(material)) {
                    material.forEach(item => {
                        materials.add(item);
                    });
                } else {
                    materials.add(material);
                };
            };
            if (material == riddle.item) is_self_craft |= true;
        });
    });
    return (numberOfMaterials > 1 && !is_self_craft && materials.size > 1) || mode == 1;
};

server.listen(port, () => {
    console.log("Server is running on port", port);
});