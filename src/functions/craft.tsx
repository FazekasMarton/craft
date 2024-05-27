import { recipe } from "../interfaces/recipe"
import { item } from "../interfaces/item"
import { findCraftingRecipe } from "./findCraftingRecipe"
import { convertRecipe } from "./convertRecipe"
import { Socket } from "socket.io-client"
import { ReactNode } from "react"

function craft(recipes: recipe[], items: item[], socket: Socket | undefined, craftingSlots: Array<HTMLElement | null>, setCraftedItem: (value: ReactNode | null) => void, craftedItemsRecipe: Array<null | string>, setCraftedItemsRecipe: (value: Array<null | string>) => void) {
  let craftingTablecontent: Array<string | null> = []
  craftingSlots.forEach(slot => {
    let item = slot?.title
    if(item != undefined && item != null){
      craftingTablecontent.push(item)

    }else{
      craftingTablecontent.push(null)
    }
  });
  let originalRecipe = craftingTablecontent
  let craftingRecipe = convertRecipe(craftingTablecontent)
  findCraftingRecipe(craftingRecipe, originalRecipe, recipes, items, socket, setCraftedItem, craftedItemsRecipe, setCraftedItemsRecipe)
}

export { craft }