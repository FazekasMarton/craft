import craftingTableArrow from '../assets/image/craftingtablearrow.png'
import { craftingTableProps } from "../interfaces/craftingTableProps"
import { drop } from "../functions/drop"
import { ReactNode } from 'react'
import clickSound from "../assets/audio/click.mp3"

const clickAudio = new Audio(clickSound)
clickAudio.preload = "auto"

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
                let item = props.slots[i * props.craftingTableSize.length + j]
                let img: null | ReactNode = <img
                  src={item?.src}
                  alt={item?.alt}
                  title={item?.title}
                  draggable
                  onContextMenu={(e) => {
                    let newSlots = [...props.slots]
                    newSlots[Number(((e.currentTarget as HTMLImageElement).parentNode as HTMLElement)?.id.replace("slot", ""))] = null
                    props.setSlots(newSlots)
                    e.preventDefault()
                  }}
                  onDrag={(e) => {
                    props.setDropItem(e.currentTarget as HTMLImageElement)
                  }}
                />;
                if (item == null) img = null
                return (<td
                  key={key}
                  className='cragtingTableSlot'
                  id={key}
                  onDragOver={(e) => { drop(e, props.dropItem, false, props.result, props.pc, props.slots, props.setSlots) }}
                  onDrop={(e) => { drop(e, props.dropItem, true, props.result, props.pc, props.slots, props.setSlots) }}
                  onClick={(e) => { if (!props.pc) drop(e, props.dropItem, true, props.result, props.pc, props.slots, props.setSlots) }}>
                  {img}
                </td>)
              })}
            </tr>)
          })}
        </tbody>
      </table>
      <img id='craftingArrow' src={craftingTableArrow} alt="arrow" />
      <div id='item'>
        {props.craftedItem}
      </div>
    </div>
  )
}

export { CraftingTable }