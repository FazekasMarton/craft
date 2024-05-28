import { useState, useEffect, ReactNode } from 'react'
import { item } from './interfaces/item.tsx';
import { recipe } from './interfaces/recipe.tsx';
import { hints } from './interfaces/hints.tsx';
import { tips } from './interfaces/tips.tsx';
import { error } from './interfaces/error.tsx';
import { CraftingTable } from './components/CraftingTable.tsx';
import { Tips } from './components/Tips.tsx';
import { Items } from './components/Items.tsx';
import { Achievement } from './components/Achievement.tsx';
import { Error } from './components/Error.tsx';
import io from 'socket.io-client';
import dropSound from "./assets/audio/drop.mp3"
import { craft } from './functions/craft.tsx';
import { restart } from './functions/restart.tsx';

const dropAudio = new Audio(dropSound)
dropAudio.preload = "auto"

const url: string = getBackendURL()
const socket = io(url)

function clearInputs(craftingTableSlots: Array<HTMLImageElement | null>, setCraftingTableSlots: (value: Array<HTMLImageElement | null>) => void) {
  dropAudio.play()
  let newSlots = [...craftingTableSlots]
  newSlots.forEach((_, index) => {
    newSlots[index] = null
  });
  setCraftingTableSlots(newSlots)
}

function getBackendURL() {
  let url = "http://localhost:6969"
  if (window.location.hostname != "localhost") {
    url = "https://guideianangel.herokuapp.com"
  }
  return url
}

function scrollTop(tips: number, round: number) {
  const tipsList: HTMLElement | null = document.getElementById('tipsList');
  if(tips != tipsList?.childNodes.length && round < 100){
    setTimeout(() => {
      let nextRound = round + 1
      scrollTop(tips, nextRound)
    }, 100);
  }else{
    if (tipsList) {
      tipsList.scrollTo({
        top: tipsList.scrollHeight * -1,
        behavior: "smooth"
      })
    }
  }
}

function checkPC(setPC: (value: boolean) => void) {
  const agent = navigator.userAgent
  const pc = !(/mobile|android|iphone|ipod|blackberry|windows phone|tablet|ipad|macintosh/i.test(agent.toLocaleLowerCase()) || /TV/i.test(agent))
  setPC(pc)
  return pc
}

function App() {
  const [timeOut, setTimeOut] = useState<null | ReturnType<typeof setTimeout>>(null);
  const [error, setError] = useState<error | null>(null);
  const [recipesCount, setRecipesCount] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);
  const [pc, setPC] = useState(checkPC(() => { }));
  const [items, setItems] = useState<item[]>([]);
  const [recipes, setRecipes] = useState<recipe[]>([]);
  const [search, setSearch] = useState("");
  const [dropItem, setDropItem] = useState<HTMLImageElement>();
  const [craftingTableSlots, setCraftingTableSlots] = useState<Array<null | HTMLImageElement>>(new Array(9).fill(null));
  const [craftedItem, setCraftedItem] = useState<ReactNode | null>(null);
  const [craftedItemsRecipe, setCraftedItemsRecipe] = useState<Array<null | string>>(new Array(9).fill(null));
  const [hints, setHints] = useState<hints>({
    tips: 0,
    hint1: null,
    hint2: null,
    hint3: null
  });
  const [usedHints, setUsedHints] = useState([false, false, false]);
  const craftingTableSize = new Array(3).fill(null)
  const [result, setResult] = useState<tips>();

  const errorExample: error = {
    code: 503,
    title: "Service Unavailable",
    message: "Failed to connect to the server. Please try again later."
  }

  window.addEventListener("resize", () => {
    setDropItem(undefined)
    let selectedElement = document.getElementById("selected")
    if (selectedElement != undefined) {
      selectedElement.removeAttribute("id")
    }
    checkPC(setPC)
  })

  if (!socket.connected && items.length > 0 && recipes.length > 0 && error == null && timeOut == null) {
    setTimeOut(
      setTimeout(() => {
        setError(errorExample)
      }, 5000)
    )
  } else if (socket.connected && error != null) {
    restart(setSearch, setDropItem, setCraftingTableSlots, setCraftedItem, setCraftedItemsRecipe, setHints, setUsedHints, setResult)
  } else {
    if (timeOut != null) clearTimeout(timeOut)
  }

  useEffect(() => {
    socket.on("checkTip", async (data) => {
      setHints(data.hints);
      setResult(data.result);
      clearInputs(craftingTableSlots, setCraftingTableSlots)
      setTimeout(() => {
        scrollTop(data.hints.tips, 1)
      }, 0);
    });

    return () => {
      socket.off('checkTip');
    };
  }, []);

  useEffect(() => {
    if (itemsCount < 10) {
      fetch(`${url}/items`)
        .then(response => response.json())
        .then(data => setItems(data.data))
        .catch((_) => {
          setError(errorExample)
        })
      setItemsCount(itemsCount + 1)
    }
  }, [itemsCount]);

  useEffect(() => {
    if (recipesCount < 10) {
      fetch(`${url}/recipes`)
        .then(response => response.json())
        .then(data => setRecipes(data.data))
        .catch((_) => {
          setError(errorExample)
        })
      setRecipesCount(recipesCount + 1)
    }
  }, [recipesCount]);

  useEffect(() => {
    socket.emit("newRiddle")
  }, []);

  craft(recipes, items, socket, craftingTableSlots, setCraftedItem, craftedItemsRecipe, setCraftedItemsRecipe)

  return (
    <>
      <CraftingTable craftingTableSize={craftingTableSize} dropItem={dropItem} setDropItem={setDropItem} result={result} pc={pc} slots={craftingTableSlots} setSlots={setCraftingTableSlots} craftedItem={craftedItem} />
      <Tips hints={hints} craftingTableSize={craftingTableSize} result={result} items={items} usedHints={usedHints} setUsedHints={setUsedHints} />
      <Items dropItem={dropItem} recipes={recipes} items={items} setSearch={setSearch} search={search} setDropItem={setDropItem} pc={pc} socket={socket} slots={craftingTableSlots} setSlots={setCraftingTableSlots} />
      <Achievement result={result} items={items} setResult={setResult} setSearch={setSearch} setDropItem={setDropItem} setCraftingTableSlots={setCraftingTableSlots} setCraftedItem={setCraftedItem} setCraftedItemsRecipe={setCraftedItemsRecipe} setHints={setHints} setUsedHints={setUsedHints} socket={socket}/>
      <Error error={error} />
    </>
  )
}

export default App