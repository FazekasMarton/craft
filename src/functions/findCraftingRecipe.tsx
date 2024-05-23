import { recipe } from "../interfaces/recipe";
import { item } from "../interfaces/item";
import { checkUserTip } from "./checkUserTip";
import { Socket } from "socket.io-client";
import { shapeless } from "./shapeless";
import { nonShapeless } from "./nonshapeless";
import { ReactNode } from "react";

function findCraftingRecipe(craftingRecipe: Array<Array<string | null>>, originalRecipe: Array<string | null>, recipes: recipe[], items: item[], socket: Socket | undefined, setCraftedItem: (value: ReactNode | null) => void, craftedItemsRecipe: Array<null | string>, setCraftedItemsRecipe: (value: Array<null | string>) => void) {
  let craftableItem: null | ReactNode = null
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
          craftableItem = <img
          src={i.image}
          title={i.name}
          draggable="false"
          onClick={() => {
            checkUserTip(i.name, craftingRecipe, originalRecipe, socket)
          }}
          />
        }
      });
    }
  });
  let sameCraft = true
  originalRecipe.forEach((item, index) => {
    if(item != craftedItemsRecipe[index]){
      sameCraft = false
    }
  });
  if(!sameCraft){
    setCraftedItem(craftableItem);
    setCraftedItemsRecipe(originalRecipe)
  }
}

export { findCraftingRecipe }