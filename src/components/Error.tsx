import { errorProps } from "../interfaces/errorProps"

function Error(props: errorProps) {
    let error = null
    if (props.error != null) {
        error =
            <div id='error'>
                <div id='errorContent'>
                    <h1 id='errorCode'>{props.error.code}</h1>
                    <h2 id='errorTitle'>{props.error.title}</h2>
                    <p id='errorText'>{props.error.message}</p>
                    <button id='errorButton' onClick={() => {
                        props.setError(null)
                    }}>Try again</button>
                </div>
            </div>
    }
    return (
        error
    )
}

export { Error }