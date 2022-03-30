import React from "react"
import './App.css';
import {EditorPage} from "./pages/Editor";
import {LoginPage} from "./pages/LoginPage";
import store, {wsLogin} from "./store";
import {
  ReactLocation,
  Navigate,
  Router, useNavigate, useMatch
} from "@tanstack/react-location";
import "brace/mode/yaml"
import "brace/theme/tomorrow_night_eighties"
import "@convergencelabs/ace-collab-ext/dist/css/ace-collab-ext.css"
import {useSelector} from "react-redux";
const token = process.env.REACT_APP_GOOGLE_CLIENT_ID
export const reactLocation = new ReactLocation();

const LoginPageWrapper=(props)=>{
  const nav = useNavigate()
  const {params: {room:initialRoom}} = useMatch()
  const loginSuccess = ({accessToken,room}) => {
      const uri = `ws://localhost:9000/?user=${accessToken}&room=${room}`
      store.dispatch(wsLogin(uri,null,async ({user,room})=>{
        await nav({to:`/room/${room.name}/${user.email}`})
    }))
  }
  return <LoginPage room={initialRoom} google_client_id={token} onSuccess={loginSuccess}/>
}
// const LoggedInEditorPage = ({params})
const loginRoute = {
  path: "/login",
  title: 'Login To a Room',
  element: <LoginPageWrapper />,
}
const loginRoute2 = {path:"/login/:room", element:<LoginPageWrapper />}
function RoomEditorElement(props){
  const {params:{id,username}} = useMatch();
  const {current_user,current_room} = useSelector(state=>(state?.editor ?? {}))
  if(!current_user || !current_room){
    console.log("Not logged in??")
    return <Navigate to={"/login"} from={`/room/${id}/${username}`}/>
  }else if(current_room.name !== id || current_user.email !== username){
    console.log("Mismatch!",id,username)
    return <Navigate to={`/${current_room.name}/${current_user.email}`}/>
  }
  document.title = `Room ${props.id}:  ${props.username}`
  return (< EditorPage
            room={props.id}
            user={props.username}
          />)
}
const editorRoute = {path: "/room/:id/:username", title: 'Room :id', element: <RoomEditorElement />}
const editorRoute2 = {path: "/_offline/:room/:user", title: 'offline room :room', element: <EditorPage/>}
const routes = [
  loginRoute2,
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


export default AppRouted;
