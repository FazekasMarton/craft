import { ReactNode } from "react";
import { hints } from "../interfaces/hints";
import { tips } from "../interfaces/tips";
import { error } from "../interfaces/error";

function restart(setSearch: (value: string) => void, setDropItem: (value: HTMLImageElement | undefined) => void, setCraftingTableSlots: (value: Array<null | HTMLImageElement>) => void, setCraftedItem: (value: ReactNode | null) => void, setCraftedItemsRecipe: (value: Array<null | string>) => void, setHints: (value: hints) => void, setUsedHints: (value: Array<boolean>) => void, setResult: (value: tips | undefined) => void, setError: (value: error | null) => void) {
  setSearch("");
  setDropItem(undefined);
  setCraftingTableSlots(new Array(9).fill(null));
  setCraftedItem(null);
  setCraftedItemsRecipe(new Array(9).fill(null));
  setHints({
    tips: 0,
    hint1: null,
    hint2: null,
    hint3: null
  });
  setUsedHints([false, false, false]);
  setResult(undefined);
  setError(null)
}

export { restart }