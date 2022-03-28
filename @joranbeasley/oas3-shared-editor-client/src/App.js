import React from "react"
import './App.css';
import {EditorPage} from "./pages/Editor";
import {LoginPage} from "./pages/LoginPage";
import store, {wsLogin} from "./store";
import {useDispatch, useSelector} from "react-redux";
import {
  Link,
  MakeGenerics,
  Outlet,
  ReactLocation,
  Navigate,
  Router,
  useMatch,
} from "@tanstack/react-location";
import "brace/mode/yaml"
import "brace/theme/tomorrow_night_eighties"
import "@convergencelabs/ace-collab-ext/dist/css/ace-collab-ext.css"
// const [room, user] = document.location.pathname.substr(1).split("/", 2)
const token = process.env.REACT_APP_GOOGLE_CLIENT_ID
export const reactLocation = new ReactLocation();

const loginSuccess = ({accessToken,room}) => {
  const uri = `ws://localhost:9000/?user=${accessToken}&room=${room}`
  store.dispatch(wsLogin(uri))
}
// const LoggedInEditorPage = ({params})
const loginRoute = {
  path: "/login",
  title: 'Login To a Room',
  element: <LoginPage google_client_id={token} onSuccess={loginSuccess}/>
}
const editorRoute = {
  path: "/room/:id/:username", title: 'Room :id', element: ({params}) => {


    return new Promise(resolve => {
      const {current_user,current_room} = store.getState().editor
      if(!current_user || !current_room){
        // not logged in or did not enter a room
        console.log("Redirect to login")
        resolve(<Navigate to={"/login"} />)
      }else {
        if(current_room.name !== params.id || current_user.email !== params.username){
           resolve(<Navigate to={`/room/${current_room.name}/${current_user.email}`} />)
        }else {
          resolve(< EditorPage
            room={params.id}
            user={params.username}
          />)
        }
      }
    })
  }
}
const editorRoute2 = {
  path: "/_offline/:id/:username", title: 'offline room :id', element: ({params}) => {
    console.log("offline route!:", params)
    return Promise.resolve(<EditorPage room={params.id} user={params.username}/>)
  }
}
const routes = [
  loginRoute,
  editorRoute,
  editorRoute2,
  {element: <Navigate to="/login"/>,}, //fallback
]

function AppRouted() {
  return (<Router
    location={reactLocation}
    routes={routes}
  />)
}

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

export default AppRouted;
