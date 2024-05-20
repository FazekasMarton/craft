import { hints } from "./hints"
import { tips } from "./tips"
import { item } from "./item"

interface tipsProps{
    hints: hints,
    result: tips | undefined,
    craftingTableSize: any[],
    items: item[],
    usedHints: boolean[],
    setUsedHints: (value: boolean[]) => void,
}

export type {tipsProps}