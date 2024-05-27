import clickSound from "../assets/audio/click.mp3"

function getHintContent(numberOfTips: number, hint: number | string | null, hintNumber: number, usedHint: boolean[], setUsedHint: (value: boolean[]) => void) {
    let content = <></>
    if (hint == null) {
        content = <button>Hint after {hintNumber * 5 - numberOfTips} turn!</button>
    } else if (usedHint[hintNumber]) {
        content = <div className='hint'>{hint}</div>
    } else {
        content = <button onClick={() => {
            const clickAudio = new Audio(clickSound)
            clickAudio.preload = "auto"
            clickAudio.play()
            const updatedUsedHint = [...usedHint];
            updatedUsedHint[hintNumber] = true;
            setTimeout(() => {
                setUsedHint(updatedUsedHint);
            }, clickAudio.duration * 500);
        }}>Reveal hint</button>
    }
    return content
}

export { getHintContent }