import moveVideo from "../assets/video/move.mp4"
import copyVideo from "../assets/video/copy.mp4"
import removeVideo from "../assets/video/remove.mp4"
import { Link, Outlet } from "react-router-dom"
import clickSound from "../assets/audio/click.mp3"

const clickAudio = new Audio(clickSound)
clickAudio.preload = "auto"

function Guide(){
    return (
        <div id="guideWrapper">
            <div id="contentTable">
                <Link id='backToMenu' onClick={() => { clickAudio.play() }} to="/"><button>Exit</button></Link>
                <ul>
                    <li><a href="#control">Control</a></li>
                    <ul>
                        <li><a href="#controlMove">Move</a></li>
                        <li><a href="#controlCopy">Copy</a></li>
                        <li><a href="#controlRemove">Remove</a></li>
                    </ul>
                </ul>
                <Outlet/>
            </div>
            <div id="content">
                <div id="control">
                    <h1>Control</h1>
                    <div id="controlContent">
                        <div id="controlMove">
                            <h2>Move</h2>
                            <video src={moveVideo} autoPlay loop/>
                            <p>You can move items from a slot to another by holding the <b>left mouse click</b>.</p>
                        </div>
                        <div id="controlCopy">
                            <h2>Copy</h2>
                            <video src={copyVideo} autoPlay loop/>
                            <p>You can copy items by holding the <b>left</b> and the <b>right mouse clicks</b> at the same time.</p>
                        </div>
                        <div id="controlRemove">
                            <h2>Remove</h2>
                            <video src={removeVideo} autoPlay loop/>
                            <p>You can remove items from the slots with the <b>right mouse click</b>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { Guide }