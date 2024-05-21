import craftingTableArrow from '../assets/craftingtablearrow.png'
import { tipsProps } from "../interfaces/tipsProps"
import { getHintContent } from '../functions/getHintContent'
import { findImage } from '../functions/findImage'

function Tips(props: tipsProps) {
    return (
        <div id='tips'>
            <div id='hintContainer'>
                <div id='hintsTitle'>Hints:</div>
                <div id='hints'>
                    <div>{getHintContent(props.hints.tips, props.hints.hint1, 1, props.usedHints, props.setUsedHints)}</div>
                    <div>{getHintContent(props.hints.tips, props.hints.hint2, 2, props.usedHints, props.setUsedHints)}</div>
                    <div>{getHintContent(props.hints.tips, props.hints.hint3, 3, props.usedHints, props.setUsedHints)}</div>
                </div>
            </div>
            <div id='tipsContainer'>
                <div id='tipsTitle'>Tips:</div>
                <div id='tipsList'>
                    {props.result?.tippedRecipes.map((item, index) => {
                        return (
                            <div id={`craftingTable${index}`} key={`craftingTable${index}`} className='tipCrafting'>
                                <table>
                                    <tbody>
                                        {props.craftingTableSize.map((_, i) => {
                                            return (
                                                <tr key={`row${index}_${i}`}>
                                                    {props.craftingTableSize.map((_, j) => {
                                                        let key = `slot${index}_${i * props.craftingTableSize.length + j}`
                                                        return (
                                                            <td key={key} className={`craftingTableSlot ${item[i * props.craftingTableSize.length + j][Object.keys(item[i * props.craftingTableSize.length + j])[0]]}`}>
                                                                <img src={findImage(String(Object.keys(item[i * props.craftingTableSize.length + j])[0]), props.items)}></img>
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                <img id={`craftingArrow${index}`} src={craftingTableArrow} alt="arrow" className='craftingArrow' />
                                <div id={`item${index}`} className='tippedItem'>
                                    <img src={findImage(props.result?.tippedItems[index], props.items)}></img>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export { Tips }