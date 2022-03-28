import React from 'react'
import "./login-page.css"
import {LoginForm} from "../components/LoginForm";

export function LoginPage({
                            onLoginRequest, onSuccess, // listeners/callbacks
                       // -- OAUTH CREDENTIALS and redirect_uri --
                            redirect_uri,
                            google_client_id,
                            github_client_id,
                          }) {
  return <div className={"login-body"}>
    <LoginForm {...{google_client_id, github_client_id, redirect_uri}} onSuccess={onSuccess}/>
  </div>
}
