import React from "react"
import logo from './logo.svg';
import {AceEditor, AceEditorWS} from "./components/Editor";
import './App.css';
import "brace/mode/yaml"
import "brace/theme/tomorrow_night_eighties"
import {EditorPage} from "./pages/Editor";

import {LoginPage} from "./pages/LoginPage";
import "@convergencelabs/ace-collab-ext/dist/css/ace-collab-ext.css"
// const WSS = process.env.REACT_APP_WSS;
const [room, user] = document.location.pathname.substr(1).split("/", 2)
function App() {
  return (
    // <LoginPage />
    <EditorPage room={room} user={user}/>
  );
}

export default App;
