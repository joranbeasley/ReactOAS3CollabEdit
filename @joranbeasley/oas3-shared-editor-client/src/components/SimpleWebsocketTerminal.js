import React from "react";

import {useDispatch, useSelector} from "react-redux";
import {wsLogin} from "../store";

export function SimpleWebsocketTerminal({ws_url="ws://localhost:9000",autoconnect=true}){
  const {connection_state} = useSelector(state=>({connection_state:state.ws.readyState}))
  console.log("Connection State:",connection_state)
  const [url,setURL] = React.useState(ws_url)
  React.useEffect(()=>{
    if(ws_url !== url){
      setURL(ws_url)
    }
  },[ws_url])
  const dispatch = useDispatch()
  const a = -1
  const connection_state_color = {
    '-1':"grey",
    [WebSocket.CLOSING]:"yellow",
    [WebSocket.CONNECTING]:"yellow",
    [WebSocket.OPEN]:"green",
    [WebSocket.CLOSED]:"red"
  }[connection_state]
  const indicator_style = {position:"absolute", top:"20px",right:"20px",
                            display:'block',width:'25px',height:'25px',
                            borderRadius:'1rem',backgroundColor:connection_state_color}
  return <div>
    <input value={ws_url} /><button onClick={()=>{
      dispatch(wsLogin(ws_url))
  }}>Connect</button>

    <div style={{position:"relative",border:'thin solid black',display: 'block', width: '600px', height: '600px'}}>
      <div style={indicator_style} />
    </div>
  </div>
}
