import { errorProps } from "../interfaces/errorProps"
import clickSound from "../assets/audio/click.mp3"

const clickAudio = new Audio(clickSound)
clickAudio.preload = "auto"

function Error(props: errorProps) {
    let error = null
    if (props.error != null) {
        error =
            <div id="errorBorder">
                <div id='error'>
                    <div id='errorContent'>
                        <h1 id='errorCode'>{props.error.code}</h1>
                        <h2 id='errorTitle'>{props.error.title}</h2>
                        <p id='errorText'>{props.error.message}</p>
                        <button id='errorButton' onClick={() => {
                            clickAudio.play()
                            props.setError(null)
                        }}>Try again</button>
                    </div>
                </div>
            </div>
    }
    return (
        error
    )
}

export { Error }