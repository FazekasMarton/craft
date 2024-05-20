import { recipe } from "../interfaces/recipe";

function shapeless(craftingRecipe: Array<Array<string | null>>, recipe: recipe) {
    let flatCraftingRecipe = craftingRecipe.flat()
    let match = true
    recipe.recipe.forEach(row => {
      row.forEach(material => {
        if (!Array.isArray(material) && material != null) {
          let index = flatCraftingRecipe.indexOf(material)
          if (index == -1) {
            match = false
          } else {
            flatCraftingRecipe.splice(index, 1)
          }
        }
      });
    });
    if (match) {
      recipe.recipe.forEach(row => {
        row.forEach(material => {
          if (Array.isArray(material) && !material.includes(null) && match) {
            match = false
            material.forEach(mat => {
              if (flatCraftingRecipe.includes(mat)) {
                let index = flatCraftingRecipe.indexOf(mat)
                flatCraftingRecipe.splice(index, 1)
                match = true
              }
            });
          }
        });
      });
      if (match) {
        recipe.recipe.forEach(row => {
          row.forEach(material => {
            if (Array.isArray(material) && material.includes(null) && match) {
              material.forEach(mat => {
                if (flatCraftingRecipe.includes(mat)) {
                  let index = flatCraftingRecipe.indexOf(mat)
                  flatCraftingRecipe.splice(index, 1)
                  match = true
                }
              });
            }
          });
        });
        if(match){
          for (let i = 0; i < flatCraftingRecipe.length; i++) {
            if(flatCraftingRecipe[i] == null){
              flatCraftingRecipe.splice(i, 1)
              i--
            }
          }
        }
      }
    }
    return match && flatCraftingRecipe.length == 0
}

export {shapeless}