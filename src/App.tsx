import io from 'socket.io-client';
import { Playmat } from './components/Playmat.tsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Menu } from './components/Menu.tsx';
import "./Menu.css"
import './Guide.css'
import './Playmat.css'
import { Guide } from './components/Guide.tsx';

const url: string = getBackendURL()
let socket = io(url)

function getBackendURL() {
  let url = "http://localhost:6969"
  if (window.location.hostname != "localhost") {
    url = "https://guideianangel.herokuapp.com"
  }
  return url
}

function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route>
          <Route index element={<Menu/>} />
          <Route path="howtoplay" element={<Guide/>} />
          <Route path="classic" element={<Playmat socket={socket} url={url} mode={0}/>} />
          <Route path="allinone" element={<Playmat socket={socket} url={url} mode={1}/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App