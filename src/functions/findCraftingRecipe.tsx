import { recipe } from "../interfaces/recipe";
import { item } from "../interfaces/item";
import { checkUserTip } from "./checkUserTip";
import { Socket } from "socket.io-client";
import { shapeless } from "./shapeless";
import { nonShapeless } from "./nonshapeless";

function findCraftingRecipe(craftingRecipe: Array<Array<string | null>>, originalRecipe: Array<string | null>, recipes: recipe[], item: HTMLElement | null, items: item[], socket: Socket | undefined) {
  recipes.forEach(recipe => {
    let isRecipeCorrect = false
    if (recipe.shapeless) {
      isRecipeCorrect = shapeless(craftingRecipe, recipe)
    } else {
      isRecipeCorrect = nonShapeless(craftingRecipe, recipe)
    }
    if (isRecipeCorrect) {
      items.forEach(i => {
        if (i.name == recipe.item) {
          let craftedItem = document.createElement("img")
          craftedItem.src = i.image
          craftedItem.draggable = false
          craftedItem.addEventListener("click", () => { checkUserTip(i.name, craftingRecipe, originalRecipe, socket) })
          item?.appendChild(craftedItem)
        }
      });
    }
  });
}

export { findCraftingRecipe }