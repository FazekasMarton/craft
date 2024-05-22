import craftingTableArrow from '../assets/image/craftingtablearrow.png'
import { craftingTableProps } from "../interfaces/craftingTableProps"
import { drop } from "../functions/drop"

function CraftingTable(props: craftingTableProps) {
  return (
    <div id='craftingTable'>
      <div id='craftingTitle'>Crafting</div>
      <table>
        <tbody>
          {props.craftingTableSize.map((_, i) => {
            return (<tr key={`row${i}`}>
              {props.craftingTableSize.map((_, j) => {
                let key = `slot${i * props.craftingTableSize.length + j}`
                return (<td key={key} className='cragtingTableSlot' id={key} onDragOver={(e) => { drop(e, props.dropItem, props.setDropItem, props.recipes, props.items, false, props.result, props.pc, props.socket) }} onDrop={(e) => { drop(e, props.dropItem, props.setDropItem, props.recipes, props.items, true, props.result, props.pc, props.socket) }} onClick={(e) => { if (!props.pc) drop(e, props.dropItem, props.setDropItem, props.recipes, props.items, true, props.result, props.pc, props.socket) }}></td>)
              })}
            </tr>)
          })}
        </tbody>
      </table>
      <img id='craftingArrow' src={craftingTableArrow} alt="arrow" />
      <div id='item'></div>
    </div>
  )
}

export { CraftingTable }