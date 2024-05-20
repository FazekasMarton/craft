import { recipe } from "../interfaces/recipe"
import { item } from "../interfaces/item"
import { tips } from "../interfaces/tips"
import { craft } from "./craft"
import { Socket } from "socket.io-client"

function drop(e: React.DragEvent | React.MouseEvent, dropItem: HTMLElement | undefined, setDropItem: (element: HTMLElement) => void, recipes: recipe[], items: item[], drop: boolean, result: tips | undefined, pc: boolean, socket: Socket | undefined) {
  if (e.currentTarget.childNodes.length == 0 && dropItem != undefined && !result?.solved) {
    e.preventDefault()
    let newElement = dropItem as HTMLElement
    if (e.buttons == 2 || e.buttons == 3 || drop) {
      if (!drop || (dropItem?.parentNode as HTMLElement)?.className == "itemSlot") newElement = dropItem?.cloneNode() as HTMLElement
      newElement.addEventListener("drag", (e) => {
        setDropItem(e.currentTarget as HTMLElement)
      })
      newElement.addEventListener("contextmenu", (e) => {
        (e.currentTarget as HTMLElement).remove()
        craft(recipes, items, socket)
        e.preventDefault()
      })
      e.currentTarget.appendChild(newElement)
    }
  } else if (!pc) {
    e.currentTarget.childNodes[0].remove()
  }
  craft(recipes, items, socket)
}

export { drop }