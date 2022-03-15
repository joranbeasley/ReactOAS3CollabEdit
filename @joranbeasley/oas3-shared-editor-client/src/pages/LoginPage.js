import React from 'react'
import {FaGithub, FaYoutube} from 'react-icons/fa'
import "./login-page.css"
const front_end_tech = ["Javascript","Ace Editor","SwaggerUI","React","Redux","WebSocket"]
const back_end = ["Python3","autobahn","twisted","google-api"]
const github = ""
const youtube = ""

export function LoginForm(){
  const [room,setRoom] = React.useState()
  return <div className={"login-form"}>
      <input value={room} onChange={e=>setRoom(e.currentTarget.value)}/>
      <button>Login</button>
    </div>
}
export function About(){
  return <div>
    <FaGithub fontSize={"30px"} /><br/>View On Github<br/>
    <FaYoutube color={"red"} fontSize={"30px"} /><br/>How I Made it
    <div className={"tech-stack"}>
      <span className={'tech-label'}>Frontend: </span> {front_end_tech.join(", ")}
    </div>
    <div className={"tech-stack"}>
      <span className={'tech-label'}>Backend: </span> {back_end.join(", ")}
    </div>

  </div>
}
export function LoginPage(){
  return <div className={"login-body"}>
    <LoginForm />
    <About />
  </div>
}
