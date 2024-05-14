import React, { useState, useEffect } from 'react'
import craftingTableArrow from './assets/craftingtablearrow.png'
import searchicon from './assets/searchicon.png'
import io from 'socket.io-client';

const socket = io('http://localhost:6969');

interface item{
  name: string,
  namespacedId: string,
  description: string,
  image: string,
  renewable: boolean,
  stackSize: number
}

interface recipe{
  item: string,
  quantity: number,
  recipe: Array<Array<null | string | string[]>>
  shapeless: boolean
}

function drop(e: React.DragEvent, dropItem: HTMLElement | undefined, setDropItem:(element: HTMLElement)=>void, recipes:recipe[], items:item[], drop:boolean){
  if(e.currentTarget.childNodes.length == 0){
    e.preventDefault()
    let newElement = dropItem as HTMLElement
    if(e.buttons == 2 || e.buttons == 3 || drop){
      if(!drop || (dropItem?.parentNode as HTMLElement)?.className == "itemSlot") newElement = dropItem?.cloneNode() as HTMLElement
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

function craft(recipes:recipe[], items:item[]){
  let item = document.getElementById("item")
  item?.childNodes[0]?.remove()
  let craftingTablecontent:string[] = []
  for (let i = 0; i < 9; i++) {
    let craftSlot = document.getElementById(`slot${i}`)
    let itemName:string = (craftSlot?.childNodes[0] as HTMLImageElement)?.title
    if(itemName == undefined){
      itemName == null
    }
    craftingTablecontent.push(itemName)
  }
  let craftingRecipe = convertRecipe(craftingTablecontent)
  findCraftingRecipe(craftingRecipe, recipes, item, items)
}

function findCraftingRecipe(craftingRecipe:string[][], recipes: recipe[], item:HTMLElement | null, items:item[]){
  recipes.forEach(recipe => {
    let isRecipeCorrect = false
    if(craftingRecipe?.length == recipe.recipe?.length && craftingRecipe[0]?.length == recipe.recipe[0]?.length){
      isRecipeCorrect = true
      recipe.recipe.forEach((row, i) => {
        row.forEach((material, j) => {
          if(!(material == craftingRecipe[i][j] || (material?.includes(craftingRecipe[i][j]) && Array.isArray(material)))) isRecipeCorrect = isRecipeCorrect && false
        });
      });
    }
    if(isRecipeCorrect){
      items.forEach(i => {
        if(i.name == recipe.item){
          let craftedItem = document.createElement("img")
          craftedItem.src = i.image
          craftedItem.draggable = false
          item?.appendChild(craftedItem)
        }
      });
    }
  });
}

function convertRecipe(recipe:string[]){
  let craftMatrix:string[][] = [[],[],[]]
  let col = 0
  let row = 0
  recipe.forEach(material => {
      craftMatrix[row].push(material)
      col++
      if(col == 3){
          col = 0
          row++
      }
  });
  for (let i = 0; i < craftMatrix.length; i++) {
      let isAllNull = true
      craftMatrix[i].forEach(material => {
          if(material != null) isAllNull = isAllNull && false
      });
      if(isAllNull){
          craftMatrix.splice(i, 1)
          i--
      }
  }
  for (let i = 0; i < craftMatrix[0]?.length; i++) {
      let isAllNull = true
      for (let j = 0; j < craftMatrix.length; j++) {
          if(craftMatrix[j][i] != null) isAllNull = isAllNull && false
      }
      if(isAllNull){
          for (let j = 0; j < craftMatrix.length; j++) {
              craftMatrix[j].splice(i, 1)
          }
          i--
      }
  }
  return craftMatrix
}

function App() {
  const [items, setItems] = useState<item[]>([]);
  const [recipes, setRecipes] = useState<recipe[]>([]);
  const [search, setSearch] = useState("");
  const [dropItem, setDropItem] = useState<HTMLElement>();
  const craftingTableSize = new Array(3).fill(null)

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
              return(<tr key={`row${i}`}>
                {craftingTableSize.map((value, j) => {
                  let key = `slot${i*craftingTableSize.length+j}`
                  return(<td key={key} className='cragtingTableSlot' id={key} onDragOver={(e) => {drop(e, dropItem, setDropItem, recipes, items, false)}} onDrop={(e) => {drop(e, dropItem, setDropItem, recipes, items, true)}}></td>)
                })}
              </tr>)
            })}
          </tbody>
        </table>
        <img id='craftingArrow' src={craftingTableArrow} alt="arrow"/>
        <div id='item'></div>
      </div>
      <div id='tips'></div>
      <div id='items' onDragOver={(e) => {e.preventDefault()}} onDrop={(e) => {if((dropItem?.parentNode as HTMLElement)?.className != "itemSlot") dropItem?.remove(); craft(recipes, items)}}>
        <div id='itemBar'>
          <div id='inventoryTitle'>Inventory</div>
          <div id='itemSearch'>
            <img id='searchIcon' src={searchicon} alt="search"/>
            <input id='search' type="text" placeholder='Search...' onInput={(e)=>{setSearch(e.currentTarget.value)}}/>
          </div>
        </div>
        <div id='inventory'>
          <div id='slots'>
            {items.map((item:item, index) => {
              let display:string = "none"
              if(item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())) display = "flex"
              return (
                <div key={`itemSlot#${index}`} className='itemSlot' style={{display: display}}>
                  <img src={item.image} alt={item.name} title={item.name} draggable onDrag={(e) => {setDropItem(e.currentTarget)}}/>
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