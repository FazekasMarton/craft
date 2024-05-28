import { Socket } from "socket.io-client"

function checkUserTip(craftedItem: string, craftingRecipe: Array<Array<string | null>>, originalRecipe: Array<string | null>, socket: Socket | undefined) {
    console.log({ craftedItem: craftedItem, craftingRecipe: craftingRecipe, originalRecipe: originalRecipe })
    socket?.emit("checkTip", { craftedItem: craftedItem, craftingRecipe: craftingRecipe, originalRecipe: originalRecipe })
}

export { checkUserTip }