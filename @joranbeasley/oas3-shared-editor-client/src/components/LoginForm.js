import React from "react";
import GoogleLogin from "react-google-login";
import GitHubLogin from "./login_buttons/GithubLogin";
import {About as AboutApplication} from "./AboutInfo";
import {useSelector} from "react-redux";

function SimpleLoginForm({onLoginRequest}) {
  const [creds, setCreds] = React.useState({u: '', p: ''})
  return <div>
    <input value={creds.u} onChange={e => setCreds({p: creds.p, u: e.currentTarget.value})}/>
    <input type={"password"} value={creds.p} onChange={e => setCreds({u: creds.u, p: e.currentTarget.value})}/>
    <button>Login</button>
  </div>
}

export function LoginForm({onSuccess, redirect_uri, google_client_id, github_client_id, onLoginRequest}) {
  const [room, setRoom] = React.useState('')
  const connectionError = useSelector(state=>state.ws.connectionError)
  const login_buttons = []
  if(connectionError === "Connection.FAIL"){
    login_buttons.push(<><h5>Websocket Connection Unavailable!</h5><button id='offline-join-btn' key="OFFLINE" onClick={()=>{
      document.location.href = "/_offline/asd/asd"
    }}>Offline Mode</button></>)
  } else {
    if (google_client_id && google_client_id.length > 7) {
      login_buttons.push(<GoogleLogin key="google-btn"
                                      clientId={google_client_id}
                                      redirectUri={redirect_uri}
                                      onSuccess={(r) => {
                                        console.log("GR:", r)
                                        onSuccess({...r.profileObj, accessToken: r.accessToken, room})
                                      }}/>)
    }
    if (github_client_id && github_client_id.length > 7) {
      login_buttons.push(<GitHubLogin key={"github-btn"} clientId={github_client_id}
                                      redirectUri={redirect_uri}
                                      onSuccess={r => onSuccess({...r, room})}/>)
    }
    if (login_buttons.length === 0) {
      login_buttons.push(<SimpleLoginForm key='form-btn' onLoginRequest={(username, password) => {
        onLoginRequest({username, password, room})
      }}/>)
    }
  }
  return <div className={"login"}>
    <h1>Login To a Room Below</h1>
    <h2>A Collaborative OAS3 Editor</h2>
    <input value={room} placeholder={"enter room name."} onChange={e => setRoom(e.currentTarget.value)}/>
    {login_buttons}
    <AboutApplication/>
  </div>
}
