import { achievementProps } from "../interfaces/achievementProps"
import { findImage } from "../functions/findImage"

function Achievement(props: achievementProps) {
    let achievement = <></>
    if (props.result?.solved) {
        let item = props.result.tippedItems[props.result.tippedItems.length - 1]
        achievement = <div id='achievement'>
            <img id='achievementImage' src={findImage(item, props.items)} alt="solvedRidle" />
            <div id='achievementTitle'>Challenge Complete!</div>
            <button id='achievementButton' onClick={() => { location.reload() }}>New Game</button>
            <div id='achievementText'>Solve The Riddle: {item}</div>
        </div>
    }
    return (achievement)
}

export { Achievement }