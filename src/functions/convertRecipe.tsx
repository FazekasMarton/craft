function convertRecipe(recipe: Array<string | null>) {
  let craftMatrix: Array<Array<string | null>> = [[], [], []]
  let col = 0
  let row = 0
  recipe.forEach(material => {
    craftMatrix[row].push(material)
    col++
    if (col == 3) {
      col = 0
      row++
    }
  });
  for (let a = 0; a < 2; a++) {
    for (let i = 0; i < craftMatrix.length; i++) {
      let isAllNull = true
      if (i != 1 || craftMatrix.length < 3) {
        craftMatrix[i].forEach(material => {
          if (material != null) isAllNull = isAllNull && false
        });
        if (isAllNull) {
          craftMatrix.splice(i, 1)
          i--
        }
      }
    }
    for (let i = 0; i < craftMatrix[0]?.length; i++) {
      let isAllNull = true
      if (i != 1 || craftMatrix[0].length < 3) {
        for (let j = 0; j < craftMatrix.length; j++) {
          if (craftMatrix[j][i] != null) isAllNull = isAllNull && false
        }
        if (isAllNull) {
          for (let j = 0; j < craftMatrix.length; j++) {
            craftMatrix[j].splice(i, 1)
          }
          i--
        }
      }
    }
  }
  return craftMatrix
}

export { convertRecipe }