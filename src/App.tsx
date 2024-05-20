import { useState, useEffect } from 'react'
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

const url: string = getBackendURL()
const socket = io(url)

function clearInputs() {
  for (let i = 0; i < 9; i++) {
    const element = document.getElementById(`slot${i}`);
    if (element) {
      element.innerHTML = "";
    }
  }
  let item = document.getElementById("item")
  item?.childNodes[0]?.remove()
}

function getBackendURL() {
  let url = "http://localhost:6969"
  if (window.location.hostname != "localhost") {
    url = "https://guideianangel.herokuapp.com"
  }
  return url
}

function scrollTop() {
  const tipsList: HTMLElement | null = document.getElementById('tipsList');
  if (tipsList) {
    tipsList.scrollTo({
      top: tipsList.scrollHeight * -1,
      behavior: "smooth"
    })
  }
}

function checkPC(setPC: (value: boolean) => void) {
  const agent = navigator.userAgent.toLocaleLowerCase()
  const pc = !/mobile|android|iphone|ipod|blackberry|windows phone|tablet|ipad|macintosh/i.test(agent)
  setPC(pc)
  return pc
}

function App() {
  const [error, setError] = useState<error | null>(null);
  const [count, setCount] = useState(0);
  const [pc, setPC] = useState(checkPC(() => { }));
  const [items, setItems] = useState<item[]>([]);
  const [recipes, setRecipes] = useState<recipe[]>([]);
  const [search, setSearch] = useState("");
  const [dropItem, setDropItem] = useState<HTMLElement>();
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

  if(!socket.connected && items.length > 0 && recipes.length > 0 && error == null){
    setError(errorExample)
  }

  socket.on("hints", data => {
    setHints(data);
  });

  socket.on("checkTip", data => {
    setResult(data);
    clearInputs()
    setTimeout(() => {
      scrollTop()
    }, 1);
  });

  useEffect(() => {
    if (count < 10) {
      fetch(`${url}/items`)
        .then(response => response.json())
        .then(data => setItems(data.data))
        .catch((_) => {
          setError(errorExample)
        })
      setCount(count + 1)
    }
  }, [count]);

  useEffect(() => {
    if (count < 10) {
      fetch(`${url}/recipes`)
        .then(response => response.json())
        .then(data => setRecipes(data.data))
        .catch((_) => {
          setError(errorExample)
        })
      setCount(count + 1)
    }
  }, [count]);


  return (
    <>
      <CraftingTable craftingTableSize={craftingTableSize} dropItem={dropItem} setDropItem={setDropItem} recipes={recipes} items={items} result={result} pc={pc} socket={socket} />
      <Tips hints={hints} craftingTableSize={craftingTableSize} result={result} items={items} usedHints={usedHints} setUsedHints={setUsedHints} />
      <Items dropItem={dropItem} recipes={recipes} items={items} setSearch={setSearch} search={search} setDropItem={setDropItem} pc={pc} socket={socket} />
      <Achievement result={result} items={items}/>
      <Error error={error} />
    </>
  )
}

export default App