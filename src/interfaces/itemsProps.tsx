import { recipe } from "./recipe"
import { item } from "./item"
import { Socket } from "socket.io-client"

interface itemsProps {
    dropItem: HTMLImageElement | undefined
    recipes: recipe[]
    items: item[],
    setSearch: (value: string) => void,
    search: string,
    setDropItem: (value: HTMLImageElement | undefined) => void,
    pc: boolean,
    socket: Socket | undefined,
    slots: Array<null | HTMLImageElement>,
    setSlots: (value: Array<null | HTMLImageElement>) => void
}

export type { itemsProps }