import searchicon from '../assets/image/searchicon.png'
import { itemsProps } from "../interfaces/itemsProps";
import { item } from "../interfaces/item";
import { craft } from "../functions/craft";
import { selectItem } from '../functions/selectItem';

function Items(props: itemsProps) {
    return (
        <div id='items' onDragOver={(e) => { e.preventDefault() }} onDrop={() => { if ((props.dropItem?.parentNode as HTMLElement)?.className != "itemSlot") props.dropItem?.remove(); craft(props.recipes, props.items, props.socket) }}>
            <div id='itemBar'>
                <div id='inventoryTitle'>Inventory</div>
                <div id='itemSearch'>
                    <img id='searchIcon' src={searchicon} alt="search" />
                    <input id='search' type="text" placeholder='Search...' onInput={(e) => { props.setSearch(e.currentTarget.value) }} />
                </div>
            </div>
            <div id='inventory'>
                <div id='slots'>
                    {props.items.map((item: item, index) => {
                        let display: string = "none"
                        if (item.name.toLocaleLowerCase().includes(props.search.toLocaleLowerCase())) display = "flex"
                        return (
                            <div key={`itemSlot#${index}`} className='itemSlot' style={{ display: display }}>
                                <img src={item.image} alt={item.name} title={item.name} draggable onDrag={(e) => { props.setDropItem(e.currentTarget) }} onClick={(e) => { selectItem(e, props.setDropItem, props.pc) }} />
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export { Items }