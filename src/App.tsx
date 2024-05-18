import React, { useState, useEffect, ReactNode, ReactElement, AriaAttributes } from 'react'
import craftingTableArrow from './assets/craftingtablearrow.png'
import searchicon from './assets/searchicon.png'
import io from 'socket.io-client';

const socket = io('http://localhost:6969');

interface item {
  name: string,
  namespacedId: string,
  description: string,
  image: string,
  renewable: boolean,
  stackSize: number
}

interface recipe {
  item: string,
  quantity: number,
  recipe: Array<Array<null | string | Array<string | null>>>
  shapeless: boolean
}

interface hints {
  tips: number,
  hint1: string | null,
  hint2: string | null,
  hint3: string | null
}

interface tips {
  tippedRecipes: [],
  tippedItems: []
}

function drop(e: React.DragEvent, dropItem: HTMLElement | undefined, setDropItem: (element: HTMLElement) => void, recipes: recipe[], items: item[], drop: boolean) {
  if (e.currentTarget.childNodes.length == 0) {
    e.preventDefault()
    let newElement = dropItem as HTMLElement
    if (e.buttons == 2 || e.buttons == 3 || drop) {
      if (!drop || (dropItem?.parentNode as HTMLElement)?.className == "itemSlot") newElement = dropItem?.cloneNode() as HTMLElement
      newElement.addEventListener("drag", (e) => {
        setDropItem(e.currentTarget as HTMLElement)
      })
      newElement.addEventListener("contextmenu", (e) => {
        (e.currentTarget as HTMLElement).remove()
        craft(recipes, items)
        e.preventDefault()
      })
      e.currentTarget.appendChild(newElement)
    }
  }
  craft(recipes, items)
}

function craft(recipes: recipe[], items: item[]) {
  let item = document.getElementById("item")
  item?.childNodes[0]?.remove()
  let craftingTablecontent: Array<string | null> = []
  for (let i = 0; i < 9; i++) {
    let craftSlot = document.getElementById(`slot${i}`)
    let itemName: string | null= (craftSlot?.childNodes[0] as HTMLImageElement)?.title
    if (itemName == undefined) {
      itemName = null
    }
    craftingTablecontent.push(itemName)
  }
  let originalRecipe = craftingTablecontent
  let craftingRecipe = convertRecipe(craftingTablecontent)
  findCraftingRecipe(craftingRecipe, originalRecipe, recipes, item, items)
}

function findCraftingRecipe(craftingRecipe: Array<Array<string | null>>, originalRecipe: Array<string | null>, recipes: recipe[], item: HTMLElement | null, items: item[]) {
  recipes.forEach(recipe => {
    let isRecipeCorrect = false
    if (recipe.shapeless) {
      isRecipeCorrect = shapeless(craftingRecipe, recipe)
    } else {
      isRecipeCorrect = nonShapeless(craftingRecipe, recipe)
    }
    if (isRecipeCorrect) {
      items.forEach(i => {
        if (i.name == recipe.item) {
          let craftedItem = document.createElement("img")
          craftedItem.src = i.image
          craftedItem.draggable = false
          craftedItem.addEventListener("click", () => {chekcUserTip(i.name, craftingRecipe, originalRecipe)})
          item?.appendChild(craftedItem)
          getHints()
        }
      });
    }
  });
}

function chekcUserTip(craftedItem: string, craftingRecipe: Array<Array<string | null>>, originalRecipe: Array<string | null>){
  socket.emit("checkTip", {craftedItem: craftedItem,craftingRecipe: craftingRecipe, originalRecipe: originalRecipe})
}

function shapeless(craftingRecipe: Array<Array<string | null>>, recipe: recipe) {
  let flatCraftingRecipe = craftingRecipe.flat()
  let match = true
  recipe.recipe.forEach(row => {
    row.forEach(material => {
      if (!Array.isArray(material) && material != null) {
        let index = flatCraftingRecipe.indexOf(material)
        if (index == -1) {
          match = false
        } else {
          flatCraftingRecipe.splice(index, 1)
        }
      }
    });
  });
  if (match) {
    recipe.recipe.forEach(row => {
      row.forEach(material => {
        if (Array.isArray(material) && !material.includes(null) && match) {
          match = false
          material.forEach(mat => {
            if (flatCraftingRecipe.includes(mat)) {
              let index = flatCraftingRecipe.indexOf(mat)
              flatCraftingRecipe.splice(index, 1)
              match = true
            }
          });
        }
      });
    });
    if (match) {
      recipe.recipe.forEach(row => {
        row.forEach(material => {
          if (Array.isArray(material) && material.includes(null) && match) {
            material.forEach(mat => {
              if (flatCraftingRecipe.includes(mat)) {
                let index = flatCraftingRecipe.indexOf(mat)
                flatCraftingRecipe.splice(index, 1)
                match = true
              }
            });
          }
        });
      });
      if(match){
        for (let i = 0; i < flatCraftingRecipe.length; i++) {
          if(flatCraftingRecipe[i] == null){
            flatCraftingRecipe.splice(i, 1)
            i--
          }
        }
      }
    }
  }
  return match && flatCraftingRecipe.length == 0
}

function nonShapeless(craftingRecipe: Array<Array<string | null>>, recipe: recipe) {
  let isRecipeCorrect = false
  if (craftingRecipe?.length == recipe.recipe?.length && craftingRecipe[0]?.length == recipe.recipe[0]?.length) {
    isRecipeCorrect = true
    recipe.recipe.forEach((row, i) => {
      row.forEach((material, j) => {
        if (!(material == craftingRecipe[i][j] || (Array.isArray(material) && material?.includes(craftingRecipe[i][j])))) isRecipeCorrect = isRecipeCorrect && false
      });
    });
  }
  return isRecipeCorrect
}

function convertRecipe(recipe: Array<string | null>) {
  let craftMatrix: Array<Array<string | null>> = [[], [], []]
  let col = 0
  let row = 0
  recipe.forEach(material => {
    craftMatrix[row].push(material)
    col++
    if (col == 3) {
      col = 0
      row++
    }
  });
  for (let a = 0; a < 2; a++) {
    for (let i = 0; i < craftMatrix.length; i++) {
      let isAllNull = true
      if (i != 1 || craftMatrix.length < 3) {
        craftMatrix[i].forEach(material => {
          if (material != null) isAllNull = isAllNull && false
        });
        if (isAllNull) {
          craftMatrix.splice(i, 1)
          i--
        }
      }
    }
    for (let i = 0; i < craftMatrix[0]?.length; i++) {
      let isAllNull = true
      if (i != 1 || craftMatrix[0].length < 3) {
        for (let j = 0; j < craftMatrix.length; j++) {
          if (craftMatrix[j][i] != null) isAllNull = isAllNull && false
        }
        if (isAllNull) {
          for (let j = 0; j < craftMatrix.length; j++) {
            craftMatrix[j].splice(i, 1)
          }
          i--
        }
      }
    }
  }
  return craftMatrix
}

function getHints() {
  socket.emit("getHints")
}

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

function App() {
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

  socket.on("hints", data => {
    setHints(data);
  });

  socket.on("checkTip", data => {
    setResult(data);
  });

  useEffect(() => {
    fetch("http://localhost:6969/items")
      .then(response => response.json())
      .then(data => setItems(data.data))
  }, []);

  useEffect(() => {
    fetch("http://localhost:6969/recipes")
      .then(response => response.json())
      .then(data => setRecipes(data.data))
  }, []);

  return (
    <>
      <div id='craftingTable'>
        <div id='craftingTitle'>Crafting</div>
        <table>
          <tbody>
            {craftingTableSize.map((value, i) => {
              return (<tr key={`row${i}`}>
                {craftingTableSize.map((value, j) => {
                  let key = `slot${i * craftingTableSize.length + j}`
                  return (<td key={key} className='cragtingTableSlot' id={key} onDragOver={(e) => { drop(e, dropItem, setDropItem, recipes, items, false) }} onDrop={(e) => { drop(e, dropItem, setDropItem, recipes, items, true) }}></td>)
                })}
              </tr>)
            })}
          </tbody>
        </table>
        <img id='craftingArrow' src={craftingTableArrow} alt="arrow" />
        <div id='item'></div>
      </div>
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
                      {craftingTableSize.map((value, i) => {
                        return (
                          <tr key={`row${index}_${i}`}>
                            {craftingTableSize.map((value, j) => {
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
                  <img id={`craftingArrow${index}`} src={craftingTableArrow} alt="arrow" />
                  <div id={`item${index}`} className='tippedItem'>
                    <img src={findImage(result?.tippedItems[index],items)}></img>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div id='items' onDragOver={(e) => { e.preventDefault() }} onDrop={(e) => { if ((dropItem?.parentNode as HTMLElement)?.className != "itemSlot") dropItem?.remove(); craft(recipes, items) }}>
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
                  <img src={"null"} alt={item.name} title={item.name} draggable onDrag={(e) => { setDropItem(e.currentTarget) }} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default App