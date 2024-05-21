import { recipe } from "../interfaces/recipe"
import { item } from "../interfaces/item"
import { findCraftingRecipe } from "./findCraftingRecipe"
import { convertRecipe } from "./convertRecipe"
import { Socket } from "socket.io-client"

function craft(recipes: recipe[], items: item[], socket: Socket | undefined) {
  let item = document.getElementById("item")
  item?.childNodes[0]?.remove()
  let craftingTablecontent: Array<string | null> = []
  for (let i = 0; i < 9; i++) {
    let craftSlot = document.getElementById(`slot${i}`)
    let itemName: string | null = (craftSlot?.childNodes[0] as HTMLImageElement)?.title
    if (itemName == undefined) {
      itemName = null
    }
    craftingTablecontent.push(itemName)
  }
  let originalRecipe = craftingTablecontent
  let craftingRecipe = convertRecipe(craftingTablecontent)
  findCraftingRecipe(craftingRecipe, originalRecipe, recipes, item, items, socket)
}

export { craft }