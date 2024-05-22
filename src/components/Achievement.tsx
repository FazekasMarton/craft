import { achievementProps } from "../interfaces/achievementProps"
import { findImage } from "../functions/findImage"
import achievementSound from "../assets/audio/achievement.mp3"
import clickSound from "../assets/audio/click.mp3"

const achievementAudio = new Audio(achievementSound)
achievementAudio.preload = "auto"
const clickAudio = new Audio(clickSound)
clickAudio.preload = "auto"

function Achievement(props: achievementProps) {
    let achievement = <></>
    if (props.result?.solved) {
        achievementAudio.play()
        let item = props.result.tippedItems[props.result.tippedItems.length - 1]
        achievement = <div id='achievement'>
            <img id='achievementImage' src={findImage(item, props.items)} alt="solvedRidle" />
            <div id='achievementTitle'>Challenge Complete!</div>
            <button id='achievementButton' onClick={() => { 
                clickAudio.play()
                setTimeout(() => {
                    location.reload() 
                }, clickAudio.duration * 1000);
            }}>New Game</button>
            <div id='achievementText'>Solve The Riddle: {item}</div>
        </div>
    }
    return (achievement)
}

export { Achievement }