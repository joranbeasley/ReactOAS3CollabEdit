import {useSelector} from "react-redux";
import SwaggerUI from "swagger-ui-react";
import React from "react";

export function SwaggerUIView(){
  const json = useSelector(state=>state?.editor?.json)
  console.log("Got New JSON",json)
  return <div style={{width: '100%',display:"block",height:"100%"}}>
      <SwaggerUI spec={json}/>
    </div>
}
