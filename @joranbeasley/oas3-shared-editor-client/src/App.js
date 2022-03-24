import React from "react"
import './App.css';
import {EditorPage} from "./pages/Editor";
import {LoginPage} from "./pages/LoginPage";
import {wsLogin} from "./store";
import {useDispatch, useSelector} from "react-redux";
import "brace/mode/yaml"
import "brace/theme/tomorrow_night_eighties"
import "@convergencelabs/ace-collab-ext/dist/css/ace-collab-ext.css"
// const [room, user] = document.location.pathname.substr(1).split("/", 2)
const token = process.env.REACT_APP_GOOGLE_CLIENT_ID
function App() {
  const dispatch = useDispatch()
  const readyState = useSelector(state => state.ws.readyState)
  const component = readyState === WebSocket.OPEN
    ? <EditorPage/>
    : <LoginPage
      google_client_id={token}
      onSuccess={info => {
        const uri = `ws://localhost:9000/?user=${info.accessToken}&room=${info.room}`
        dispatch(wsLogin(uri))
      }
      }/>
  return component;
}

export default App;
