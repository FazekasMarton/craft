import { recipe } from "./recipe"
import { item } from "./item"
import { Socket } from "socket.io-client"

interface itemsProps{
    dropItem: HTMLElement | undefined
    recipes: recipe[]
    items: item[],
    setSearch: (value: string) => void,
    search: string,
    setDropItem: (value: HTMLElement | undefined) => void,
    pc: boolean,
    socket: Socket
  }

export type {itemsProps}