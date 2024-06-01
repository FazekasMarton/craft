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
                    <li><a href="#gameplay">Gameplay and Rules</a></li>
                    <ul>
                        <li><a href="#gameplayGuessing">Guessing Rules</a></li>
                        <li><a href="#outcome">Outcome</a></li>
                    </ul>
                    <li><a href="#gamemodes">Gamemodes</a></li>
                    <ul>
                        <li><a href="#classicMode">Classic</a></li>
                        <li><a href="#allInOneMode">All In One</a></li>
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
                <div id="gameplay">
                    <h1>Gameplay and Rules</h1>
                    <p>You have to solve a crafting riddle by guessing crafting recipes. You will get some hints during the game.</p>
                    <div id="gameplayContent">
                        <div id="gameplayGuessing">
                            <h2>Guessing Rules</h2>
                            <ul>
                                <li>You can only guess an existing item's recipe</li>
                                <li>You can only guess a recipe once (but some items has more than one recipe)</li>
                            </ul>
                        </div>
                        <div id="outcome">
                            <h2>Outcome</h2>
                            <p>After you guessed, it turns out how many materials were correct in the recipe. In this regard, you may encounter three indications.</p>
                            <ul>
                                <li><b className="indicator" id="redIndicator">Red</b>: The materials marked in red are not found in the recipe.</li>
                                <li><b className="indicator" id="yellowIndicator">Yellow</b>: The materials marked in yellow are found in the recipe but are not in their place.</li>
                                <li><b className="indicator" id="greenIndicator">Green</b>: The materials marked in green can be found in the recipe and are in their place.</li>
                                (Empty slots are not marked!)
                            </ul>
                            <p>Important: We shape the feedback in such a way that the best results are returned, so you may experience "<b>recipe sliding</b>" during the game.</p>
                            <p><b>Recipe sliding</b>: When the size of an object's crafting recipe is smaller than 3x3, than it can be placed in several places in the crafting table. For example: Stone Button, Iron Sword, Crafting Table, etc.</p>
                        </div>
                    </div>
                </div>
                <div id="gamemodes">
                    <h1>Gamemodes</h1>
                    <div id="classicMode">
                        <h2>Classic</h2>
                        <div>Rules: </div>
                        <ul>
                            <li>Crafting Table Size: 3x3</li>
                            <li>Recipes: Every except those made of 1 piece of material or one type of material</li>
                            <li>Hints: 3 (1 for every 5th guess)</li>
                        </ul>
                    </div>
                    <div id="allInOneMode">
                        <h2>All In One</h2>
                        <div>Based on: Classic Mode</div>
                        <div>Rule chages: </div>
                        <ul>
                            <li>Recipes: Every</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { Guide }