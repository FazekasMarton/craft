import { ReactNode } from 'react';
import { tips } from './tips.tsx';

interface craftingTableProps {
    craftingTableSize: any[];
    dropItem: HTMLImageElement | undefined;
    setDropItem: (element: HTMLImageElement | undefined) => void;
    result: tips | undefined;
    pc: boolean;
    slots: Array<null | HTMLImageElement>,
    setSlots: (value: Array<null | HTMLImageElement>) => void,
    craftedItem: null | ReactNode
}

export type { craftingTableProps }