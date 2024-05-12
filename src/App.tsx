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

function App() {
  const [items, setItems] = useState<item[]>([]);
  const [search, setSearch] = useState("");

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
            <tr>
              <td className='cragtingTableSlot' id='slot0'></td>
              <td className='cragtingTableSlot' id='slot1'></td>
              <td className='cragtingTableSlot' id='slot2'></td>
            </tr>
            <tr>
              <td className='cragtingTableSlot' id='slot3'></td>
              <td className='cragtingTableSlot' id='slot4'></td>
              <td className='cragtingTableSlot' id='slot5'></td>
            </tr>
            <tr>
              <td className='cragtingTableSlot' id='slot6'></td>
              <td className='cragtingTableSlot' id='slot7'></td>
              <td className='cragtingTableSlot' id='slot8'></td>
            </tr>
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
                  <img src={item.image} alt={item.name}/>
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
