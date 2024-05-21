import { recipe } from "../interfaces/recipe";

function nonShapeless(craftingRecipe: Array<Array<string | null>>, recipe: recipe) {
  let isRecipeCorrect = false
  if (craftingRecipe?.length == recipe.recipe?.length && craftingRecipe[0]?.length == recipe.recipe[0]?.length) {
    isRecipeCorrect = true
    recipe.recipe.forEach((row, i) => {
      row.forEach((material, j) => {
        if (!(material == craftingRecipe[i][j] || (Array.isArray(material) && material?.includes(craftingRecipe[i][j])))) isRecipeCorrect = isRecipeCorrect && false
      });
    });
  }
  return isRecipeCorrect
}

export { nonShapeless }