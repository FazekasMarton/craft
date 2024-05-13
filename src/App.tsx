import { useState, useEffect } from 'react'
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

function drop(e: React.DragEvent, dropItem: HTMLElement | undefined, setDropItem:(element: HTMLElement)=>void){
  if(e.currentTarget.childNodes.length == 0){
    let newElement = dropItem?.cloneNode() as HTMLElement
    newElement.addEventListener("drag", (e) => {
      setDropItem(e.currentTarget as HTMLElement)
    })
    newElement.addEventListener("contextmenu", (e) => {
      (e.currentTarget as HTMLElement).remove()
      e.preventDefault()
    })
    e.currentTarget.appendChild(newElement)
  }
}

function App() {
  const [items, setItems] = useState<item[]>([]);
  const [search, setSearch] = useState("");
  const [dropItem, setDropItem] = useState<HTMLElement>();
  const craftingTableSize = new Array(3).fill(null)

  useEffect(() => {
    fetch("http://localhost:6969/items")
    .then(response => response.json())
    .then(data => setItems(data.data))
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
                  return(<td key={key} className='cragtingTableSlot' id={key} onDragOver={(e) => {drop(e, dropItem, setDropItem)}}></td>)
                })}
              </tr>)
            })}
          </tbody>
        </table>
        <img id='craftingArrow' src={craftingTableArrow} alt="arrow"/>
        <div id='item'/>
      </div>
      <div id='tips'></div>
      <div id='items'>
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
