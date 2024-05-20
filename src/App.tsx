import React, { useState, useEffect } from 'react'
import craftingTableArrow from './assets/craftingtablearrow.png'
import searchicon from './assets/searchicon.png'
import { item } from './interfaces/item.tsx';
import { recipe } from './interfaces/recipe.tsx';
import { hints } from './interfaces/hints.tsx';
import { tips } from './interfaces/tips.tsx';
import { CraftingTable } from './components/CraftingTable.tsx';
import { craft } from './functions/craft.tsx';
import io from 'socket.io-client';

const url:string = getBackendURL()
const socket = io(url)

function getHintContent(numberOfTips: number, hint: number | string | null, hintNumber: number, usedHint: boolean[], setUsedHint: (value: boolean[]) => void) {
  let content = <></>
  if (hint == null) {
    content = <button>Hint after {hintNumber * 5 - numberOfTips} turn!</button>
  } else if (usedHint[hintNumber]) {
    content = <div className='hint'>{hint}</div>
  } else {
    content = <button onClick={() => {
      const updatedUsedHint = [...usedHint];
      updatedUsedHint[hintNumber] = true;
      setUsedHint(updatedUsedHint);
    }}>Reveal hint</button>
  }
  return content
}

function findImage(name : string, items : item[]){
  let image : string = "";
  items.forEach(item => {
    if(item.name == name){
      image = item.image;
    }
  })
  return image;
}
  
function selectItem(e: React.MouseEvent, setDropItem: (element: HTMLElement | undefined) => void, pc: boolean){
  const targetElement = e.currentTarget;
  const parentElement = targetElement.parentElement;
  
  if (parentElement && !pc) {
    setDropItem(e.currentTarget as HTMLElement)
    const previouslySelected = document.getElementById("selected");
    if (previouslySelected) {
      previouslySelected.removeAttribute("id");
    }
    parentElement.id = "selected";
  }
}

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
      <CraftingTable craftingTableSize={craftingTableSize} dropItem={dropItem} setDropItem={setDropItem} recipes={recipes} items={items} result={result} pc={pc} socket={socket}></CraftingTable>
      <div id='tips'>
        <div id='hintContainer'>
          <div id='hintsTitle'>Hints:</div>
          <div id='hints'>
            <div>{getHintContent(hints.tips, hints.hint1, 1, usedHints, setUsedHints)}</div>
            <div>{getHintContent(hints.tips, hints.hint2, 2, usedHints, setUsedHints)}</div>
            <div>{getHintContent(hints.tips, hints.hint3, 3, usedHints, setUsedHints)}</div>
          </div>
        </div>
        <div id='tipsContainer'>
          <div id='tipsTitle'>Tips:</div>
            <div id='tipsList'>
            {result?.tippedRecipes.map((item, index) => {
              return (
                <div id={`craftingTable${index}`} key={`craftingTable${index}`} className='tipCrafting'>
                  <table>
                    <tbody>
                      {craftingTableSize.map((_, i) => {
                        return (
                          <tr key={`row${index}_${i}`}>
                            {craftingTableSize.map((_, j) => {
                              let key = `slot${index}_${i * craftingTableSize.length + j}`
                              return (
                                <td key={key} className={`craftingTableSlot ${item[i * craftingTableSize.length + j][Object.keys(item[i * craftingTableSize.length + j])[0]]}`}>
                                  <img src={findImage(String(Object.keys(item[i * craftingTableSize.length + j])[0]), items)}></img>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <img id={`craftingArrow${index}`} src={craftingTableArrow} alt="arrow" className='craftingArrow'/>
                  <div id={`item${index}`} className='tippedItem'>
                    <img src={findImage(result?.tippedItems[index],items)}></img>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div id='items' onDragOver={(e) => { e.preventDefault() }} onDrop={() => { if ((dropItem?.parentNode as HTMLElement)?.className != "itemSlot") dropItem?.remove(); craft(recipes, items, socket) }}>
        <div id='itemBar'>
          <div id='inventoryTitle'>Inventory</div>
          <div id='itemSearch'>
            <img id='searchIcon' src={searchicon} alt="search" />
            <input id='search' type="text" placeholder='Search...' onInput={(e) => { setSearch(e.currentTarget.value) }} />
          </div>
        </div>
        <div id='inventory'>
          <div id='slots'>
            {items.map((item: item, index) => {
              let display: string = "none"
              if (item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())) display = "flex"
              return (
                <div key={`itemSlot#${index}`} className='itemSlot' style={{ display: display }}>
                  <img src={item.image} alt={item.name} title={item.name} draggable onDrag={(e) => { setDropItem(e.currentTarget) }} onClick={(e) => {selectItem(e, setDropItem, pc)}}/>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {getAchievement(result, items)}
    </>
  )
}

export default App