interface recipe {
    item: string,
    quantity: number,
    recipe: Array<Array<null | string | Array<string | null>>>
    shapeless: boolean
}

export type {recipe}