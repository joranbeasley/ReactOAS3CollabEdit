import {useSelector} from "react-redux";
import SwaggerUI from "swagger-ui-react";
import React from "react";
import jsyaml from "js-yaml"

export function SwaggerUIView({yaml,json}){
  if(!json && yaml){
    json = jsyaml.load(yaml)
  }
  return <div style={{width: '100%',display:"block",height:"100%"}}>
      <SwaggerUI spec={json}/>
    </div>
}
