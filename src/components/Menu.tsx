import craftdleTitle from "../assets/image/craftdle-title.png"
import { Outlet, Link } from "react-router-dom";
import clickSound from "../assets/audio/click.mp3"

const clickAudio = new Audio(clickSound)
clickAudio.preload = "auto"

const messages = [
    "Try it!",
    "Play on TV!",
    "Awesome!",
    "May contain nuts!",
    "It's here!",
    "Excitement!",
    "Check it out!",
    "Holy cow, man!",
    "It's a game!",
    "Made in Hungary!",
    "Made by Guideian Angel!",
    "Minecraft!",
    "Yaaay!",
    "Singleplayer!",
    "Wow!",
    "Oh man!",
    "90% bug free!",
    "Pretty!",
    "Fat free!",
    "Ask your doctor!",
    "Technically good!",
    "Indie!",
    "Yes, sir!",
    "Try it!",
    "Call your mother!",
    "Whoa, dude!",
    "Water proof!",
    "Tell your friends!",
    "Kiss the sky!",
    "Peter Griffin!",
    "Home-made!",
    'Made by "real" people!',
    "Nooooooooooooo!",
    "Sniff sniff...",
    "SUS!",
]

function Menu(){
    const randomText = messages[Math.floor(Math.random() * messages.length)]
    return(
        <div id="menuWrapper">
            <div id="menuContainer">
                <div id="title">
                    <img id="craftdleTitle" src={craftdleTitle} alt="craftdle title" />
                    <div id="message">{randomText}</div>
                </div>
                <div id="gameModes">
                    <Link onClick={() => { clickAudio.play() }} to="/classic"><button>Classic</button></Link>
                    <Link onClick={() => { clickAudio.play() }} to="/allinone"><button>All In One</button></Link>
                </div>
                <div id="others">
                    <a onClick={() => { clickAudio.play() }} href="http://patreon.com/Craftdle" target="_blank"><button>Support Us</button></a>
                </div>
                <div id="info">
                    <div id="creators">by Guideian Angel</div>
                    <div id="version">vAlfa</div>
                </div>
            </div>
            <Outlet/>
        </div>
    )
}

export {Menu}