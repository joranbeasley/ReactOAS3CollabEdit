import {FaGithub} from "react-icons/fa";
import React from "react";
import {SiStorybook} from "react-icons/si";
const front_end_tech = ["Javascript", "Ace Editor", "SwaggerUI", "React", "Redux","React-Location", "WebSocket", "Playwright"]
const back_end = ["Python3", "autobahn", "twisted", "google-api"]
const github = "https://github.com/joranbeasley/ReactOAS3CollabEdit"
const storybook = ""
export function About() {
  return <>
    <h6>
      <div style={{display: "flex", justifyContent: "space-between", margin:'10px 40px'}}>
        <a href={github}><FaGithub fontSize={"30px"}/><br/>View On Github</a>
        <a href={storybook}><SiStorybook color={"pink"} fontSize={"30px"}/><br/>How I Made it</a>
      </div>
    </h6>
    <h5>

    <div className={"tech-stack"}>
      <span className={'tech-label'}>Frontend: </span> {front_end_tech.join(", ")}
    </div>
    <div className={"tech-stack"}>
      <span className={'tech-label'}>Backend: </span> {back_end.join(", ")}
    </div>
  </h5></>
}
