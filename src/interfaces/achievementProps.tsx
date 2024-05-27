import { tips } from "./tips"
import { item } from "./item"
import { ReactNode } from "react"
import { hints } from "./hints"
import { Socket } from "socket.io-client"

interface achievementProps {
    result: tips | undefined,
    items: item[],
    setSearch: (value: string) => void, 
    setDropItem: (value: HTMLImageElement | undefined) => void, 
    setCraftingTableSlots: (value: Array<null | HTMLImageElement>) => void, 
    setCraftedItem: (value: ReactNode | null) => void, 
    setCraftedItemsRecipe: (value: Array<null | string>) => void, 
    setHints: (value: hints) => void, 
    setUsedHints: (value: Array<boolean>) => void, 
    setResult: (value: tips | undefined) => void,
    socket: Socket
}

export type { achievementProps }