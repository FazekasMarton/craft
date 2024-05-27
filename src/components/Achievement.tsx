import { achievementProps } from "../interfaces/achievementProps"
import { findImage } from "../functions/findImage"
import achievementSound from "../assets/audio/achievement.mp3"
import clickSound from "../assets/audio/click.mp3"
import { restart } from "../functions/restart"

let achievementAudio:null | HTMLAudioElement = new Audio(achievementSound)
achievementAudio.preload = "auto"
const clickAudio = new Audio(clickSound)
clickAudio.preload = "auto"

function Achievement(props: achievementProps) {
    let achievement = <></>
    if (props.result?.solved) {
        achievementAudio?.play()
        achievementAudio = null
        let item = props.result.tippedItems[props.result.tippedItems.length - 1]
        achievement = <div id='achievement'>
            <img id='achievementImage' src={findImage(item, props.items)} alt="solvedRidle" />
            <div id='achievementTitle'>Challenge Complete!</div>
            <button id='achievementButton' onClick={() => { 
                clickAudio.play()
                setTimeout(() => {
                    (document.getElementById("search") as HTMLInputElement).value = ""
                    restart(props.setSearch, props.setDropItem, props.setCraftingTableSlots, props.setCraftedItem, props.setCraftedItemsRecipe, props.setHints, props.setUsedHints, props.setResult)
                    props.socket.emit("newRiddle")
                    achievementAudio = new Audio(achievementSound)
                }, clickAudio.duration * 1000);
            }}>New Game</button>
            <div id='achievementText'>Solve The Riddle: {item}</div>
        </div>
    }
    return (achievement)
}

export { Achievement }