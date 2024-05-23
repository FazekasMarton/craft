import { tips } from "../interfaces/tips"

function drop(e: React.DragEvent | React.MouseEvent, dropItem: HTMLImageElement | undefined, drop: boolean, result: tips | undefined, pc: boolean, slots: Array<null | HTMLImageElement>, setSlots: (value: Array<null | HTMLImageElement>) => void) {
  let newSlots = [...slots]
  let slotIndex = Number(e.currentTarget.id.replace("slot", ""))
  if (e.currentTarget.childNodes.length == 0 && dropItem != undefined && !result?.solved) {
    let dropParent = dropItem.parentNode as HTMLElement
    e.preventDefault()
    if(e.buttons == 2 || e.buttons == 3){
      newSlots[slotIndex] = dropItem
      setSlots(newSlots)
    }else if(drop){
      newSlots[slotIndex] = dropItem
      if(dropParent.className != "itemSlot"){
        newSlots[Number(dropParent.id.replace("slot", ""))] = null
      }
      setSlots(newSlots)
    }
  } else if (!pc) {
    newSlots[slotIndex] = null
    setSlots(newSlots)
  }
}

export { drop }