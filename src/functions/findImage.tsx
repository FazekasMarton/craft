import { item } from "../interfaces/item";

function findImage(name: string | undefined, items: item[]) {
    let image: string = "";
    items.forEach(item => {
        if (item.name == name) {
            image = item.image;
        }
    })
    return image;
}

export { findImage }