import { Socket } from 'socket.io-client';
import { item } from './item.tsx';
import { recipe } from './recipe.tsx';
import { tips } from './tips.tsx';

interface craftingTableProps {
    craftingTableSize: any[];
    dropItem: HTMLElement | undefined;
    setDropItem: (element: HTMLElement | undefined) => void;
    recipes: recipe[];
    items: item[];
    result: tips | undefined;
    pc: boolean;
    socket: Socket | undefined
}

export type { craftingTableProps }