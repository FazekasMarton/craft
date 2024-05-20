import { useState, useEffect } from 'react'
import { item } from './interfaces/item.tsx';
import { recipe } from './interfaces/recipe.tsx';
import { hints } from './interfaces/hints.tsx';
import { tips } from './interfaces/tips.tsx';
import { CraftingTable } from './components/CraftingTable.tsx';
import { Tips } from './components/Tips.tsx';
import { Items } from './components/Items.tsx';
import { findImage } from './functions/findImage.tsx';
import io from 'socket.io-client';

const url:string = getBackendURL()
const socket = io(url)

function clearInputs(){
  for (let i = 0; i < 9; i++) {
    const element = document.getElementById(`slot${i}`);
    if (element) {
      element.innerHTML = "";
    }
  }
  let item = document.getElementById("item")
  item?.childNodes[0]?.remove()
}

function getBackendURL(){
  let url = "http://localhost:6969"
  if(window.location.hostname != "localhost"){
    url = "https://guideianangel.herokuapp.com"
  }
  return url
}

function scrollTop(){
  const tipsList: HTMLElement | null = document.getElementById('tipsList');
  if (tipsList) {
    tipsList.scrollTo({
      top: tipsList.scrollHeight*-1,
      behavior: "smooth"
    })
  }
}

function getAchievement(result: tips | undefined, items: item[]){
  let achievement = <></>
  if(result?.solved){
    let item = result.tippedItems[result.tippedItems.length-1]
    achievement = <div id='achievement'>
      <img id='achievementImage' src={findImage(item, items)} alt="solvedRidle" />
      <div id='achievementTitle'>Challenge Complete!</div>
      <button id='achievementButton' onClick={() => {location.reload()}}>New Game</button>
      <div id='achievementText'>Solve The Riddle: {item}</div>
    </div>
  }
  return(achievement)
}

function checkPC(setPC: (value: boolean) => void){
  const agent = navigator.userAgent.toLocaleLowerCase()
  const pc = !/mobile|android|iphone|ipod|blackberry|windows phone|tablet|ipad|macintosh/i.test(agent)
  setPC(pc)
  return pc
}

function App() {
  const [pc, setPC] = useState(checkPC(() => {}));
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

  window.addEventListener("resize", () => {
    setDropItem(undefined)
    let selectedElement = document.getElementById("selected")
    if(selectedElement != undefined){
      selectedElement.removeAttribute("id")
    }
    checkPC(setPC)
  })

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
    fetch(`${url}/items`)
      .then(response => response.json())
      .then(data => setItems(data.data))
  }, []);

  useEffect(() => {
    fetch(`${url}/recipes`)
      .then(response => response.json())
      .then(data => setRecipes(data.data))
  }, []);

  return (
    <>
      <CraftingTable craftingTableSize={craftingTableSize} dropItem={dropItem} setDropItem={setDropItem} recipes={recipes} items={items} result={result} pc={pc} socket={socket}/>
      <Tips hints={hints} craftingTableSize={craftingTableSize} result={result} items={items} usedHints={usedHints} setUsedHints={setUsedHints}/>
      <Items dropItem={dropItem} recipes={recipes} items={items} setSearch={setSearch} search={search} setDropItem={setDropItem} pc={pc} socket={socket}/>
      {getAchievement(result, items)}
    </>
  )
}

export default App