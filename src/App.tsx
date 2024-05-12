import { useState, useEffect } from 'react'
import craftingTableArrow from './assets/craftingtablearrow.png'
import io from 'socket.io-client';

const socket = io('http://localhost:6969');

function App() {
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
      <div id='items'></div>
    </>
  )
}

export default App
