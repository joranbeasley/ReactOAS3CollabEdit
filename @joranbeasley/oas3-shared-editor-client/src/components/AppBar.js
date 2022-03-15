import React from "react";
import {useSelector} from "react-redux";
import {StatusLight} from "./Light";
function useAppBarSelector(){
  return useSelector(state=>({
    user:state.editor.current_user,
    room:state.editor.current_room,
    users:state.editor.current_users,
    connecting:state.ws.CONNECTING,
    connected:state.ws.CONNECTED,
  }))
}
export function AppBar(props){
  const {user,room,connecting,connected,users} = useAppBarSelector()
  let color = "black"
  let color2 = connected?'green':connecting?'yellow':"red"
  const style = {display:"flex",justifyContent:'space-between',width:'100%',height:'30px',backgroundColor: color}
  const style2 = {color:'#fff', padding: '5px'}
  const style_user = {...style2,marginRight:'20px'}
  return <div style={style} >
    <div style={style2}>{room?.payload} [{users?.length ?? '--'} Current Users]</div>
    <div style={{display:'flex',alignItems:'center'}}>
      <span style={style_user}>{user?.payload}</span>
      <StatusLight style={{padding:'5px'}} color={color2}/>
    </div>
  </div>
}
