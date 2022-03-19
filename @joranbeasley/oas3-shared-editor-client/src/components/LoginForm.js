import React from "react";
import GoogleLogin from "react-google-login";
import GitHubLogin from "./login_buttons/GithubLogin";
import {About as AboutApplication} from "./AboutInfo";

function SimpleLoginForm({onLoginRequest}) {
  const [creds,setCreds] = React.useState({u:'',p:''})
  return <div>
    <input value={creds.u} onChange={e=>setCreds({p:creds.p,u:e.currentTarget.value})}/>
    <input type={"password"} value={creds.p} onChange={e=>setCreds({u:creds.u,p:e.currentTarget.value})}/>
    <button>Login</button>
  </div>
}

export function LoginForm({onSuccess, redirect_uri, google_client_id, github_client_id, onLoginRequest}) {
  const [room, setRoom] = React.useState()
  const login_buttons = []
  if (google_client_id && google_client_id.length > 7) {
    login_buttons.push(<GoogleLogin key="google-btn" clientId={google_client_id}
                                    redirectUri={redirect_uri}
                                    onSuccess={(r) => onSuccess(r.profileObj)}/>)
  }
  if (github_client_id && github_client_id.length > 7) {
    login_buttons.push(<GitHubLogin key={"github-btn"} clientId={github_client_id}
                                    redirectUri={redirect_uri}
                                    onSuccess={onSuccess}/>)
  }

  if (login_buttons.length === 0) {
    login_buttons.push(<SimpleLoginForm key='form-btn' onLoginRequest={(username, password) => {
      onLoginRequest({username, password, room})
    }}/>)
  }
  return <div className={"login"}>
    <h1>Login To a Room Below</h1>
    <h2>A Collaborative OAS3 Editor</h2>
    <input value={room} placeholder={"enter roomname."} onChange={e => setRoom(e.currentTarget.value)}/>
    {login_buttons}
    <AboutApplication />
  </div>
}
