import { Socket } from "socket.io-client"

interface playmatProps{
    socket: Socket,
    url: string,
    mode: number
}

export type { playmatProps }